import { store, MemoryCountry, MemoryVisaProgram } from '../../data/store';
import { CreateCountrySchema, CreateVisaProgramSchema, ContinentName, ProgramStatus } from '@thevisagate/shared';
import crypto from 'crypto';
import { FirebaseDatabaseService } from '../../services/firebase.service';
import { WORLD_COUNTRIES } from '../../data/world-countries';

export class CountryService {
  /**
   * Return complete static ISO reference list of all 195 world countries (for dropdown selectors)
   */
  static getWorldList() {
    return WORLD_COUNTRIES;
  }
  /**
   * List all countries with programs count and active programs
   */
  static async list(query?: { continent?: string; search?: string; featuredOnly?: boolean | string; activeOnly?: boolean | string }) {
    let filtered = [...store.countries];

    if (query?.activeOnly !== undefined && (query.activeOnly === false || query.activeOnly === 'false')) {
      // Admin requests both active and inactive
    } else {
      filtered = filtered.filter((c) => c.isActive !== false);
    }

    if (query?.continent && query.continent !== 'ALL') {
      filtered = filtered.filter((c) => c.continent.toLowerCase() === query.continent!.toLowerCase());
    }

    if (query?.featuredOnly === true || query?.featuredOnly === 'true') {
      filtered = filtered.filter((c) => c.isFeatured);
    }

    if (query?.search) {
      const s = query.search.toLowerCase().trim();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s));
    }

    // Sort by displayOrder asc, then name
    filtered.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return a.name.localeCompare(b.name);
    });

    return filtered.map((c) => {
      const programs = store.visaPrograms.filter((p) => p.countryId === c.id);
      const categories = store.visaCategories.filter((cat) => cat.countryId === c.id);
      const activePrograms = programs.filter(
        (p) => (p.programStatus === ProgramStatus.ACTIVE || p.programStatus === ProgramStatus.PUBLISHED)
      );
      const bookablePrograms = activePrograms.filter((p) => p.bookingEnabled);

      return {
        ...c,
        totalProgramsCount: programs.length,
        activeProgramsCount: activePrograms.length,
        bookableProgramsCount: bookablePrograms.length,
        // Provide both programs and categories (with name and id unified) for compatibility
        categories: [
          ...categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            code: cat.code,
            defaultProcessingDays: cat.defaultProcessingDays,
          })),
          ...programs.map((p) => ({
            id: p.id,
            name: `${p.programName} (${p.visaCategory})`,
            code: p.visaCategory,
            defaultProcessingDays: p.defaultProcessingDays,
          })),
        ],
        programs: activePrograms.map((p) => ({
          id: p.id,
          name: p.programName,
          programName: p.programName,
          visaCategory: p.visaCategory,
          description: p.description,
          eligibility: p.eligibility,
          requiredDocuments: p.requiredDocuments,
          serviceInformation: p.serviceInformation,
          programStatus: p.programStatus,
          bookingEnabled: p.bookingEnabled,
          defaultProcessingDays: p.defaultProcessingDays,
          consultationFee: p.consultationFee,
        })),
      };
    });
  }

  /**
   * Get single country details with its full programs list
   */
  static async getById(id: string) {
    const country = store.countries.find((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
    if (!country) throw { statusCode: 404, message: 'Country not found' };

    const programs = store.visaPrograms.filter((p) => p.countryId === country.id);
    return {
      ...country,
      programs,
    };
  }

  /**
   * Create new destination country (Admin)
   */
  static async createCountry(data: any) {
    const validated = CreateCountrySchema.parse(data);

    const existing = store.countries.find((c) => c.code.toUpperCase() === validated.code.toUpperCase());
    if (existing) throw { statusCode: 409, message: `Country with code '${validated.code}' already exists` };

    const newCountry: MemoryCountry = {
      id: `country-${validated.code.toLowerCase()}`,
      name: validated.name.trim(),
      code: validated.code.toUpperCase().trim(),
      continent: validated.continent,
      flagEmoji: validated.flagEmoji || '🌐',
      description: validated.description || '',
      isFeatured: validated.isFeatured || false,
      displayOrder: validated.displayOrder || store.countries.length + 1,
      currency: validated.currency,
      capital: validated.capital,
      isActive: validated.isActive !== false,
    };

    store.countries.push(newCountry);
    store.saveToDisk();
    FirebaseDatabaseService.syncCountry(newCountry).catch(() => {});
    return newCountry;
  }

  /**
   * Update existing country (Admin)
   */
  static async updateCountry(id: string, data: Partial<MemoryCountry>) {
    const country = store.countries.find((c) => c.id === id);
    if (!country) throw { statusCode: 404, message: 'Country not found' };

    if (data.name) country.name = data.name.trim();
    if (data.continent) country.continent = data.continent;
    if (data.flagEmoji) country.flagEmoji = data.flagEmoji;
    if (data.description !== undefined) country.description = data.description;
    if (data.isFeatured !== undefined) country.isFeatured = data.isFeatured;
    if (data.displayOrder !== undefined) country.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) country.isActive = data.isActive;
    if (data.currency) country.currency = data.currency;
    if (data.capital) country.capital = data.capital;

    store.saveToDisk();
    FirebaseDatabaseService.syncCountry(country).catch(() => {});
    return country;
  }

  /**
   * Delete destination country post and all associated programs (Admin)
   */
  static async deleteCountry(id: string) {
    const countryIndex = store.countries.findIndex((c) => c.id === id || c.code.toLowerCase() === id.toLowerCase());
    if (countryIndex === -1) throw { statusCode: 404, message: 'Destination country not found' };

    const removedCountry = store.countries[countryIndex];
    store.countries.splice(countryIndex, 1);

    // Also remove associated visa programs and categories
    store.visaPrograms = store.visaPrograms.filter((p) => p.countryId !== removedCountry.id);
    store.visaCategories = store.visaCategories.filter((cat) => cat.countryId !== removedCountry.id);

    store.saveToDisk();
    FirebaseDatabaseService.deleteCountry(removedCountry.id).catch(() => {});
    return { success: true, message: `Country '${removedCountry.name}' removed successfully` };
  }

  /**
   * List all programs with optional filters
   */
  static async listPrograms(query?: { countryId?: string; status?: string; bookingOnly?: boolean }) {
    let programs = [...store.visaPrograms];

    if (query?.countryId) {
      programs = programs.filter((p) => p.countryId === query.countryId);
    }
    if (query?.status) {
      programs = programs.filter((p) => p.programStatus === query.status);
    }
    if (query?.bookingOnly) {
      programs = programs.filter(
        (p) => (p.programStatus === ProgramStatus.ACTIVE || p.programStatus === ProgramStatus.PUBLISHED) && p.bookingEnabled
      );
    }

    programs.sort((a, b) => a.displayOrder - b.displayOrder);

    return programs.map((p) => {
      const country = store.countries.find((c) => c.id === p.countryId);
      return {
        ...p,
        countryName: country?.name || 'Unknown',
        countryCode: country?.code || '',
        countryFlag: country?.flagEmoji || '🌐',
        continent: country?.continent || '',
      };
    });
  }

  /**
   * Create dynamic Visa Program for a country (Admin)
   */
  static async createProgram(data: any) {
    const validated = CreateVisaProgramSchema.parse(data);

    const country = store.countries.find((c) => c.id === validated.countryId);
    if (!country) throw { statusCode: 404, message: 'Target destination country not found' };

    const newProgram: MemoryVisaProgram = {
      id: `prog-${crypto.randomUUID()}`,
      countryId: validated.countryId,
      programName: validated.programName.trim(),
      visaCategory: validated.visaCategory.trim(),
      description: validated.description.trim(),
      eligibility: validated.eligibility || '',
      requiredDocuments: validated.requiredDocuments || [],
      serviceInformation: validated.serviceInformation || '',
      startDate: validated.startDate || null,
      endDate: validated.endDate || null,
      programStatus: validated.programStatus,
      bookingEnabled: validated.bookingEnabled,
      displayOrder: validated.displayOrder || 0,
      defaultProcessingDays: validated.defaultProcessingDays || 30,
      consultationFee: validated.consultationFee || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.visaPrograms.push(newProgram);
    store.saveToDisk();
    FirebaseDatabaseService.syncVisaProgram(newProgram).catch(() => {});
    return newProgram;
  }

  /**
   * Update Visa Program (Admin)
   */
  static async updateProgram(id: string, data: any) {
    const program = store.visaPrograms.find((p) => p.id === id);
    if (!program) throw { statusCode: 404, message: 'Visa program not found' };

    if (data.programName) program.programName = data.programName.trim();
    if (data.visaCategory) program.visaCategory = data.visaCategory.trim();
    if (data.description) program.description = data.description.trim();
    if (data.eligibility !== undefined) program.eligibility = data.eligibility;
    if (data.requiredDocuments !== undefined) program.requiredDocuments = data.requiredDocuments;
    if (data.serviceInformation !== undefined) program.serviceInformation = data.serviceInformation;
    if (data.startDate !== undefined) program.startDate = data.startDate;
    if (data.endDate !== undefined) program.endDate = data.endDate;
    if (data.programStatus) program.programStatus = data.programStatus;
    if (data.bookingEnabled !== undefined) program.bookingEnabled = data.bookingEnabled;
    if (data.displayOrder !== undefined) program.displayOrder = data.displayOrder;
    if (data.defaultProcessingDays !== undefined) program.defaultProcessingDays = data.defaultProcessingDays;
    if (data.consultationFee !== undefined) program.consultationFee = data.consultationFee;

    program.updatedAt = new Date();
    store.saveToDisk();
    FirebaseDatabaseService.syncVisaProgram(program).catch(() => {});
    return program;
  }

  /**
   * Delete Visa Program (Admin)
   */
  static async deleteProgram(id: string) {
    const progIndex = store.visaPrograms.findIndex((p) => p.id === id);
    if (progIndex === -1) throw { statusCode: 404, message: 'Visa program not found' };

    const removedProgram = store.visaPrograms[progIndex];
    store.visaPrograms.splice(progIndex, 1);

    store.saveToDisk();
    FirebaseDatabaseService.deleteVisaProgram(removedProgram.id).catch(() => {});
    return { success: true, message: `Program '${removedProgram.programName}' removed successfully` };
  }
}
