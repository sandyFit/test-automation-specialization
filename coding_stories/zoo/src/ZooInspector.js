'use strict'

export class ZooInspector {
    constructor(imageRecognitionSystem, inspectionLog) {
        this.imageRecognitionSystem = imageRecognitionSystem;
        this.inspectionLog = inspectionLog;
    }

    inspect(zoo) {
        const inspection = new Inspection(zoo, this.imageRecognitionSystem);
        inspection.runInspection();
        this.inspectionLog.log(inspection.inspectionStatuses);
    }
}

class Inspection {
    constructor(zoo, imageRecognitionSystem) {
        this.zoo = zoo;
        this.imageRecognitionSystem = imageRecognitionSystem;
        this.inspectionStatuses = [];
        this.zooWarningStatus = false;
    }

    runInspection() {
        // Deleted unnecessary initialization of inspection context.
        this.inspectEnclosuresAndAnimals();
        // report inspection status
        this.reportZooStatus();
    }

    reportZooStatus() {
        this.inspectionStatuses.push(`ZOO#${this.zoo.getId()}#${this.zooWarningStatus ? 'WARNING' : 'OK'}`);
    }

    inspectEnclosuresAndAnimals() {
        this.zoo.getEnclosures().forEach(enclosure => {
            this.inspectEnclosure(enclosure);
            this.inspectAnimal(enclosure);
        });
    }

    inspectAnimal(enclosure) {
        const animalImage = this.zoo.capturePictureOf(enclosure);
        const animalStatus = this.imageRecognitionSystem.recognizeAnimalStatus(enclosure.getAnimal(), animalImage);
        if (animalStatus.isAnimalSick()) {
            this.zoo.closeEnclosure(enclosure);
            this.zoo.requestVeterinaryTo(enclosure.getAnimal());
            this.addWarningToStatuses(enclosure, true);
            this.zooWarningStatus = true;
        }
    }

    inspectEnclosure(enclosure) {
        const enclosureImage = this.zoo.capturePictureOf(enclosure, getAnimal());
        const enclosureStatus = this.imageRecognitionSystem.recognizeEnclosureStatus(enclosure, enclosureImage);
        if (!isNotSafeEnclosure(enclosureStatus)) {
            this.zoo.closeEnclosure(enclosure);
            this.zoo.requestSecurityTo(enclosure);
            this.zoo.requestMaintenanceCrewTo(enclosure);
            this.addWarningToStatuses(enclosure, false);
            this.zooWarningStatus = true;
        }
    }

    isNotSafeEnclosure(enclosureStatus) {
        return !enclosureStatus.isEnclosureSafe();
    }

    addWarningToStatuses(enclosure, isAnimal) {
        this.inspectionStatuses.push(`${isAnimal ? 'ANIMAL' : 'ENCLOSURE'}#${isAnimal ? enclosure.getAnimal().getName() : enclosure.getId()}#WARNING`);
    }
}
