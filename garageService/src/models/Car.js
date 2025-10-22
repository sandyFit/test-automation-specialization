export class Car {
    constructor(manufacturer, model, year, isClassic) {
        this.manufacturer = manufacturer;
        this.model = model;
        this.year = year;
        this.isClassic = isClassic;
    }

    toString() {
        return `${this.manufacturer} ${this.model} [${this.year}]` +
            `${this.isClassic ? Car.CLASSIC_CAR_ABBREVIATION : Car.SIMPLE_CAR_ABBREVIATION}`;
    }
}

Car.CLASSIC_CAR_ABBREVIATION = 'C';
Car.SIMPLE_CAR_ABBREVIATION = 'S';
