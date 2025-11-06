import { assert } from 'chai';
import sinon from 'sinon';

import { GarageService } from '../src/GarageService';
import { Car } from '../src/models/Car';

describe('GarageService', () => {
    let garageService = null;
    const garageCleaningService = {
        clean: sinon.spy()
    };

    const parkCarsInAllGarages = () => {
        let busyGarages = new Map();
        GarageService.SECURE_GARAGES.forEach(increasedSecurityGarage => busyGarages.set(increasedSecurityGarage, new Car()));
        GarageService.SIMPLE_GARAGES.forEach(usualGarage => busyGarages.set(usualGarage, new Car()));
        garageService.garagesWithCar = busyGarages;
    };

    beforeEach(() => {
        garageService = new GarageService(garageCleaningService)
    });

    it('when car is parked then garage is cleaned', () => {
        const simpleCar = new Car('Toyota', 'Prius', 2015, false);
        garageService.registerInGarage(simpleCar);
        assert.isTrue(garageCleaningService.clean.calledOnceWith(sinon.match.any));
    });

    it('when car is classic then parked to increased security garage', () => {
        const classicCar = new Car('Aston Martin', 'DB4', 1958, true);
        const garageWhereCarIsParked = garageService.registerInGarage(classicCar);
        assert.isTrue(GarageService.SECURE_GARAGES.includes(garageWhereCarIsParked));
    });

    it('when car is not classic then parked to usual garage', () => {
        const simpleCar = new Car('Toyota', 'Prius', 2015, false);
        const garageWhereCarIsParked = garageService.registerInGarage(simpleCar);
        assert.isTrue(GarageService.SIMPLE_GARAGES.includes(garageWhereCarIsParked));
    });


    it('when all garages have cars then error is thrown', () => {
        const simpleCar = new Car('Toyota', 'Prius', 2015, false);
        parkCarsInAllGarages();
        assert.throw(
            garageService.registerInGarage.bind(garageService, simpleCar),
            'Free garage is not found'
        );
    });
});
