import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { Prescription } from './entities/prescription.entity';
import { PresDetail } from './entities/presdetail.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private PrescriptionRepository: Repository<Prescription>,
    @InjectRepository(PresDetail)
    private PresDetailRepository: Repository<PresDetail>,
  ) {}

  async encrypt(data: any) {
    const iv = randomBytes(16);
    const password = process.env.CYPHER_KEY;

    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encryptedText = Buffer.concat([cipher.update(data), cipher.final()]);
    return `${iv.toString('hex')}:${encryptedText.toString('hex')}`;
  }

  async decrypt(data: any) {
    const [iv, encryptedText] = data
      .split(':')
      .map((x: any) => Buffer.from(x, 'hex'));
    const password = process.env.CYPHER_KEY;

    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const decryptedText = Buffer.concat([
      cipher.update(encryptedText),
      cipher.final(),
    ]);
    return decryptedText.toString();
  }

  async create(body: any, user: any) {
    const { prescription, presDetails } = body;

    // Encrypt prescription data concurrently
    const [
      encryptedName,
      encryptedDescription,
      encryptedDoctor,
      encryptedNotes,
    ] = await Promise.all([
      this.encrypt(prescription.name),
      this.encrypt(prescription.description),
      this.encrypt(prescription.doctor),
      this.encrypt(prescription.notes),
    ]);

    // Create the prescription
    const newPrescription = this.PrescriptionRepository.create({
      name: encryptedName,
      description: encryptedDescription,
      doctor: encryptedDoctor,
      patient: user.id,
      date: new Date(),
      status: 'P',
      notes: encryptedNotes,
      created_by: user.id,
    });

    const savedPrescription =
      await this.PrescriptionRepository.save(newPrescription);

    // Encrypt presDetails concurrently
    const encryptedDetails = await Promise.all(
      presDetails.map(async (detail: any) => ({
        prescriptionId: savedPrescription.id,
        medicine: await this.encrypt(detail.medicine),
        dosage: await this.encrypt(detail.dosage),
        duration: await this.encrypt(detail.duration),
        frequency: await this.encrypt(detail.frequency),
      })),
    );

    // Save all prescription details in bulk
    await this.PresDetailRepository.save(encryptedDetails);

    return {
      message: 'Prescription created successfully',
    };
  }

  async findAll(user: any) {
    const isAdmin = user?.role === 3 || user?.role === 5; // Example condition, replace with actual logic if needed

    const baseQuery = `
      SELECT a.*, CONCAT(b.firstName, ' ', b.lastName) AS patientName
      FROM prescription a
      LEFT OUTER JOIN user b ON a.patient = b.id`;

    const query = isAdmin
      ? baseQuery
      : `${baseQuery} WHERE a.patient = ${user.id}`;

    const prescriptions = await this.PrescriptionRepository.query(query);

    // Decrypt the prescription data
    const decryptPrescription = async (prescription: any) => {
      const [
        decryptedName,
        decryptedDescription,
        decryptedDoctor,
        decryptedNotes,
      ] = await Promise.all([
        this.decrypt(prescription.name),
        this.decrypt(prescription.description),
        this.decrypt(prescription.doctor),
        this.decrypt(prescription.notes),
      ]);

      const presDetails = await this.PresDetailRepository.find({
        where: { prescriptionId: prescription.id },
      });

      // Decrypt the prescription details concurrently
      const decryptedPresDetails = await Promise.all(
        presDetails.map(async (presDetail) => {
          const [
            decryptedMedicine,
            decryptedDosage,
            decryptedDuration,
            decryptedFrequency,
          ] = await Promise.all([
            this.decrypt(presDetail.medicine),
            this.decrypt(presDetail.dosage),
            this.decrypt(presDetail.duration),
            this.decrypt(presDetail.frequency),
          ]);
          return {
            ...presDetail,
            medicine: decryptedMedicine,
            dosage: decryptedDosage,
            duration: decryptedDuration,
            frequency: decryptedFrequency,
          };
        }),
      );

      return {
        ...prescription,
        name: decryptedName,
        description: decryptedDescription,
        doctor: decryptedDoctor,
        notes: decryptedNotes,
        isOwner:
          parseInt(prescription.patient.toString()) === parseInt(user.id),
        presDetails: decryptedPresDetails,
      };
    };

    const decryptedPrescriptions = await Promise.all(
      prescriptions.map(decryptPrescription),
    );

    return decryptedPrescriptions;
  }

  async delete(id: number, user: any) {
    const prescription = await this.PrescriptionRepository.findOne({
      where: { id },
    });

    if (!prescription) {
      throw new BadRequestException('Prescription not found');
    }

    if (parseInt(prescription.patient.toString()) !== parseInt(user.id)) {
      throw new BadRequestException(
        'You are not authorized to delete this prescription',
      );
    }

    await this.PrescriptionRepository.delete(id);

    await this.PresDetailRepository.delete({ prescriptionId: id });

    return {
      message: 'Prescription deleted successfully',
      id: prescription.id,
    };
  }
}
