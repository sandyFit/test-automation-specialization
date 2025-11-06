'use strict';

const UNIT_RATE = 0.8;
export class UserAccount {
    constructor() {
        this.paymentDates = [];
        this.services = [];
    }

    recalculateBalance() {
        for (const service of this.services) {
            this.recalculateService(service);
        }
    }

    recalculateService(service) {
        const history = this.getHistoryFromService(service);
        this.payTariff(history, this.getHighestTariff(service));
    }

    getHistoryFromService(service) {
        return this.calculationHistoryService.retrieveHistory(service);
    }

    payTariff(history, highestTariff) {
        history.applyRecalculation(highestTariff, UNIT_RATE);
        this.balance.updateBalance(highestTariff);
    }

    getHighestTariff(service) {
        const tariffs = service.getTariffs();
        let highestTariff = 0;

        for (const tariff of tariffs) {
            const unappliedTariff = this.getUnappliedTariff(tariff, service);
            highestTariff = Math.max(highestTariff, unappliedTariff);
        }

        return highestTariff;
    }

    getUnappliedTariff(tariff, service) {
        const history = this.getHistoryFromService(service);
        const allHistoryFees = history.getAllFees(tariff, service);

        return this.calculateUnapplied(tariff, allHistoryFees);
    }

    calculateUnapplied(tariff, fees) {
        let sum = 0;

        for (const date of fees.keys()) {
            if (date > this.getLastCalculationDate()) {
                sum += this.calculateFee(tariff, fees.get(date));
            }
        }
        return sum;
    }

    getLastCalculationDate() {
        let latest = UserAccount.EPOCH_TIMESTAMP;
        for (const p of this.paymentDates) {
            latest = Math.max(p.getTime(), latest);
        }
        return new Date(latest);
    }

    calculateFee(tariff, fee) {
        return fee * this.getRate(tariff) + tariff.getAdditionalFee();
    }

    getRate(tariff) {
        const isUnitBased = tariff.getType().isUnitBased();
        return isUnitBased ? UNIT_RATE : 1;
    }

    setCalculationHistoryService(calculationHistoryService) {
        this.calculationHistoryService = calculationHistoryService;
    }

    setServices(services) {
        this.services = services;
    }

    setBalance(balance) {
        this.balance = balance;
    }

    setPaymentDates(paymentDates) {
        this.paymentDates = paymentDates;
    }
}

UserAccount.EPOCH_TIMESTAMP = 0;
