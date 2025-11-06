'use strict'

export class GarageService {
    constructor(garageCleaningService) {
        this.garageCleaningService = garageCleaningService;

        this.garagesWithCars = new Map();
    }

    registerInGarage(car) {
        const garages = car.IsClassic ? GarageService.SECURE_GARAGES : GarageService.SIMPLE_GARAGES;
        const garage = this.findFreeGarageFrom(garages);

        if (!garage) {
            throw new Error('Free garage is not found');
        }

        this.clean(garage);
        this.registerCaR(garage, car);

        return garage;
    }

    clean(garage) {
        this.garageCleaningService.clean(garage);
    }

    registerCaR(garage, car) {
        this.garagesWithCars.set(garage, car);
    }

    findFreeGarageFrom(garage) {
        return garage.find(
            garage => this.isGarageFree(garage)
        );
    }

    isGarageFree(garage) {
        return !this.garagesWithCars.has(garage);
    }
}

GarageService.SECURE_GARAGES = [1, 7]; 
GarageService.SIMPLE_GARAGES = [2, 3, 4, 5, 6];
