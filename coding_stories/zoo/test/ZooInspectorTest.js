import { assert } from 'chai';
import sinon from 'sinon';

import { ZooInspector } from '../src/ZooInspector';

class InspectionLogStub {
    log(statuses) {
        this.statuses = statuses;
    }

    getStatuses() {
        return this.statuses;
    }
};

describe('ZooInspector', () => {
    const ZOO_ID = 'zoo';
    const TEST_ENCLOSURE_ID = 'enclosure';
    const TEST_ANIMAL_NAME = 'animal';

    let zooInspector;
    let inspectionLog;
    let zoo;

    const imageRecognitionSystemMock = {
        clean: sinon.spy()
    };

    const verifyLog = (...statuses) => {
        const expectedStatuses = statuses;
        const actualStatuses = inspectionLog.getStatuses();
        assert.deepStrictEqual(expectedStatuses, actualStatuses);
    };

    beforeEach(() => {
        inspectionLog = new InspectionLogStub();
        zooInspector = new ZooInspector(imageRecognitionSystemMock, inspectionLog);

        zoo = {
            getId: () => ZOO_ID,
            requestMaintenanceCrewTo: sinon.spy(),
            requestSecurityTo: sinon.spy(),
            requestVeterinaryTo: sinon.spy(),
            closeEnclosure: sinon.spy(),
            capturePictureOf: () => { },
        };
    });

    it('when no animals then no requests', () => {
        zoo.getEnclosures = () => [];

        zooInspector.inspect(zoo);

        assert.isTrue(zoo.requestMaintenanceCrewTo.notCalled);
        assert.isTrue(zoo.requestSecurityTo.notCalled);
        assert.isTrue(zoo.requestVeterinaryTo.notCalled);
        assert.isTrue(zoo.closeEnclosure.notCalled);

        verifyLog(`ZOO#${ZOO_ID}#OK`);
    });

    it('when enclosure and animal alright then no requests', () => {
        const animal = {};
        const enclosure = {
            getAnimal: () => animal
        };
        zoo.getEnclosures = () => [enclosure];

        const animalStatus = {
            isAnimalSick: () => false
        };
        const enclosureStatus = {
            isEnclosureSafe: () => true
        };
        imageRecognitionSystemMock.recognizeAnimalStatus = () => animalStatus;
        imageRecognitionSystemMock.recognizeEnclosureStatus = () => enclosureStatus;

        zooInspector.inspect(zoo);

        assert.isTrue(zoo.requestMaintenanceCrewTo.notCalled);
        assert.isTrue(zoo.requestSecurityTo.notCalled);
        assert.isTrue(zoo.requestVeterinaryTo.notCalled);
        assert.isTrue(zoo.closeEnclosure.notCalled);

        verifyLog(`ZOO#${ZOO_ID}#OK`);
    });

    it('when enclosure is not safe then requests', () => {
        const animal = {};
        const enclosure = {
            getAnimal: () => animal,
            getId: () => TEST_ENCLOSURE_ID
        };
        zoo.getEnclosures = () => [enclosure];

        const animalStatus = {
            isAnimalSick: () => false
        };
        const enclosureStatus = {
            isEnclosureSafe: () => false
        };
        imageRecognitionSystemMock.recognizeAnimalStatus = () => animalStatus;
        imageRecognitionSystemMock.recognizeEnclosureStatus = () => enclosureStatus;

        zooInspector.inspect(zoo);

        assert.isTrue(zoo.requestMaintenanceCrewTo.calledOnceWith(sinon.match.any));
        assert.isTrue(zoo.requestSecurityTo.calledOnceWith(sinon.match.any));
        assert.isTrue(zoo.closeEnclosure.calledOnceWith(sinon.match.any));
        // but animal is fine
        assert.isTrue(zoo.requestVeterinaryTo.notCalled);

        verifyLog(`ENCLOSURE#${TEST_ENCLOSURE_ID}#WARNING`, `ZOO#${ZOO_ID}#WARNING`);
    });

    it('when animal is sick then requests', () => {
        const animal = {
            getName: () => TEST_ANIMAL_NAME
        };
        const enclosure = {
            getAnimal: () => animal
        };
        zoo.getEnclosures = () => [enclosure];

        const animalStatus = {
            isAnimalSick: () => true
        };
        const enclosureStatus = {
            isEnclosureSafe: () => true
        };
        imageRecognitionSystemMock.recognizeAnimalStatus = () => animalStatus;
        imageRecognitionSystemMock.recognizeEnclosureStatus = () => enclosureStatus;

        zooInspector.inspect(zoo);

        assert.isTrue(zoo.closeEnclosure.calledOnceWith(sinon.match.any));
        assert.isTrue(zoo.requestVeterinaryTo.calledOnceWith(sinon.match.any));
        // but enclosure is fine
        assert.isTrue(zoo.requestMaintenanceCrewTo.notCalled);
        assert.isTrue(zoo.requestSecurityTo.notCalled);

        verifyLog(`ANIMAL#${TEST_ANIMAL_NAME}#WARNING`, `ZOO#${ZOO_ID}#WARNING`);
    });

    it('when first animal is sick and second is healthy then still requests', () => {
        const sickAnimal = {
            getName: () => 'SICK_ANIMAL'
        };
        const enclosureWithSickAnimal = {
            getAnimal: () => sickAnimal
        };

        const healthyAnimal = {
            getName: () => 'HELTHY_ANIMAL'
        };
        const enclosureWithHealthyAnimal = {
            getAnimal: () => healthyAnimal
        };

        zoo.getEnclosures = () => [enclosureWithSickAnimal, enclosureWithHealthyAnimal];

        const sickAnimalStatus = {
            isAnimalSick: () => true
        };

        const healthyAnimalStatus = {
            isAnimalSick: () => false
        };

        const enclosureStatus = {
            isEnclosureSafe: () => true
        };

        imageRecognitionSystemMock.recognizeAnimalStatus = (animal) => {
            switch (animal.getName()) {
                case healthyAnimal.getName():
                    return healthyAnimalStatus;
                case sickAnimal.getName():
                    return sickAnimalStatus;
                default:
                    return null;
            }

        };
        imageRecognitionSystemMock.recognizeEnclosureStatus = () => enclosureStatus;

        zooInspector.inspect(zoo);

        assert.isTrue(zoo.closeEnclosure.calledOnceWith(enclosureWithSickAnimal));
        assert.isTrue(zoo.requestVeterinaryTo.calledOnceWith(sickAnimal));
        // but enclosure is fine
        assert.isTrue(zoo.requestMaintenanceCrewTo.notCalled);
        assert.isTrue(zoo.requestSecurityTo.notCalled);

        verifyLog('ANIMAL#' + 'SICK_ANIMAL' + '#WARNING', `ZOO#${ZOO_ID}#WARNING`);
    });
});
