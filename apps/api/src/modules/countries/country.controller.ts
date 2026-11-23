import { Request, Response, NextFunction } from 'express';
import { CountryService } from './country.service';
import { sendSuccess } from '../../utils/response';

export class CountryController {
  // Static ISO world countries reference list (195 countries for dropdown selectors)
  static getWorldList(req: Request, res: Response) {
    const list = CountryService.getWorldList();
    return sendSuccess(res, list);
  }

  // Public country list with filters (continent, search, featured)
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const countries = await CountryService.list(req.query as any);
      return sendSuccess(res, countries);
    } catch (error) {
      next(error);
    }
  }

  // Single country with programs
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await CountryService.getById(req.params.id);
      return sendSuccess(res, country);
    } catch (error) {
      next(error);
    }
  }

  // Admin create country
  static async createCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await CountryService.createCountry(req.body);
      return sendSuccess(res, country, 'Country added successfully to directory', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin update country
  static async updateCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const country = await CountryService.updateCountry(req.params.id, req.body);
      return sendSuccess(res, country, 'Country updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Public / Admin list dynamic visa programs
  static async listPrograms(req: Request, res: Response, next: NextFunction) {
    try {
      const programs = await CountryService.listPrograms(req.query as any);
      return sendSuccess(res, programs);
    } catch (error) {
      next(error);
    }
  }

  // Admin create visa program
  static async createProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const program = await CountryService.createProgram(req.body);
      return sendSuccess(res, program, 'Visa program created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin update visa program
  static async updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const program = await CountryService.updateProgram(req.params.id, req.body);
      return sendSuccess(res, program, 'Visa program updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin delete country
  static async deleteCountry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CountryService.deleteCountry(req.params.id);
      return sendSuccess(res, result, 'Destination country removed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin delete visa program
  static async deleteProgram(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CountryService.deleteProgram(req.params.id);
      return sendSuccess(res, result, 'Visa program removed successfully');
    } catch (error) {
      next(error);
    }
  }
}
