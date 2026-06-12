import { faker } from '@faker-js/faker';

export interface UserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  company: string;
  jobTitle: string;
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface JobPostingData {
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
}

export class DataGenerator {
  static generateUser(domain = 'testmail.com'): UserData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const suffix = faker.number.int({ min: 100, max: 9999 });

    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${suffix}@${domain}`,
      password: this.generatePassword(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
    };
  }

  static generatePassword(length = 12): string {
    const pools = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      digit: '0123456789',
      special: '!@#$%^&*',
    };
    const all = Object.values(pools).join('');

    const required = Object.values(pools).map(
      (pool) => pool[Math.floor(Math.random() * pool.length)]
    );

    const rest = Array.from({ length: length - required.length }, () =>
      all[Math.floor(Math.random() * all.length)]
    );

    return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
  }

  static generateEmail(domain = 'testmail.com'): string {
    const user = faker.internet.username().toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = faker.number.int({ min: 10, max: 999 });
    return `${user}${suffix}@${domain}`;
  }

  static generateAddress(): AddressData {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zipCode: faker.location.zipCode(),
    };
  }

  static generateJobPosting(): JobPostingData {
    const types: JobPostingData['type'][] = ['full-time', 'part-time', 'contract', 'internship'];
    return {
      title: faker.person.jobTitle(),
      department: faker.commerce.department(),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      type: types[Math.floor(Math.random() * types.length)],
      description: faker.lorem.paragraphs(2),
    };
  }

  static generateCompanyName(): string {
    return faker.company.name();
  }

  static generateUUID(): string {
    return faker.string.uuid();
  }

  static generatePhoneNumber(): string {
    return faker.phone.number();
  }

  static generateDate(from?: Date, to?: Date): Date {
    return faker.date.between({
      from: from ?? new Date('2020-01-01'),
      to: to ?? new Date(),
    });
  }

  static generateNumber(min = 1, max = 1000): number {
    return faker.number.int({ min, max });
  }

  static generateAlphanumeric(length = 10): string {
    return faker.string.alphanumeric(length);
  }
}
