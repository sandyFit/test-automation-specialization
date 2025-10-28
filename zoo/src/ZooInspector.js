'use strict'

export class ZooInspector {
    constructor(imageRecognitionSystem, inspectionLog) {
        this.imageRecognitionSystem = imageRecognitionSystem;
        this.inspectionLog = inspectionLog;
    }

    inspect(zoo) {
        // Prepare context
        const inspectionStatuses = [];

        const zooWarningStatus = this.runInspection(zoo, inspectionStatuses);
        // Report results of the inspection
        inspectionStatuses.push(`ZOO#${zoo.getId()}#${zooWarningStatus ? 'WARNING' : 'OK'}`);
        this.inspectionLog.log(inspectionStatuses);
    }

    runInspection(zoo, inspectionStatuses) {
        let zooWarningStatus = false;

        zoo.getEnclosures().forEach(enclosure => {
            // Inspect enclosure
            zooWarningStatus = this.inspectEnclosure(zoo, enclosure, inspectionStatuses, zooWarningStatus);
            // Inspect animal
            zooWarningStatus = this.inspectAnimal(zoo, enclosure, inspectionStatuses, zooWarningStatus);
        });
        return zooWarningStatus;
    }
    

    inspectAnimal(zoo, enclosure, inspectionStatuses, zooWarningStatus) {
        const animalImage = this.makePicture(zoo, enclosure, true);
        const animalStatus = this.imageRecognitionSystem.recognizeAnimalStatus(enclosure.getAnimal(), animalImage);
        if (animalStatus.isAnimalSick()) {
            zoo.closeEnclosure(enclosure);
            zoo.requestVeterinaryTo(enclosure.getAnimal());
            this.addWarningToStatuses(enclosure, inspectionStatuses, true);
            return true;
        }
        return false;
    }

    inspectEnclosure(zoo, enclosure, inspectionStatuses, zooWarningStatus) {
        const enclosureImage = this.makePicture(zoo, enclosure, false);
        const enclosureStatus = this.imageRecognitionSystem.recognizeEnclosureStatus(enclosure, enclosureImage);
        if (!enclosureStatus.isEnclosureSafe()) {
            zoo.closeEnclosure(enclosure);
            zoo.requestSecurityTo(enclosure);
            zoo.requestMaintenanceCrewTo(enclosure);
            this.addWarningToStatuses(enclosure, inspectionStatuses, false);
            return true;
        }
        return false;
    }

    makePicture(zoo, enclosure, isAnimal) {
        if (isAnimal) {
            return zoo.capturePictureOf(enclosure.getAnimal());
        } else {
            return zoo.capturePictureOf(enclosure);
        }
    }

    addWarningToStatuses(enclosure, statuses, isAnimal) {
        statuses.push(`${isAnimal ? 'ANIMAL' : 'ENCLOSURE'}#${isAnimal ? enclosure.getAnimal().getName() : enclosure.getId()}#WARNING`);
    }
}
