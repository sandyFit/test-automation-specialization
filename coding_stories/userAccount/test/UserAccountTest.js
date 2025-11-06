import { BalanceStub } from './stubs/BalanceStub';
import { CalculationHistoryServiceStub } from './stubs/CalculationHistoryServiceStub';
import { ServiceStub } from './stubs/ServiceStub';
import { SecondServiceStub } from './stubs/SecondServiceStub';
import { MultiTariffServiceStub } from './stubs/MultiTariffServiceStub';
import { UnitBasedTariffStub } from './stubs/UnitBasedTariffStub';
import { NoRateTariffStub } from './stubs/NoRateTariffStub';
import { CalculationHistoryForMultiServiceStub } from './stubs/CalculationHistoryForMultiServiceStub';

import { UserAccount } from '../src/UserAccountMessy.js';

export const UNIT_RATE = 0.8;

describe('UserAccount', () => {
    let balanceStub,
        serviceStub,
        calculationHistoryServiceStub,
        multiTariffServiceStub,
        userAccount;

    beforeEach(() => {
        balanceStub = new BalanceStub();
        serviceStub = new ServiceStub();

        multiTariffServiceStub = new MultiTariffServiceStub([
            new UnitBasedTariffStub(),
            new NoRateTariffStub()
        ]);

        userAccount = new UserAccount();

        userAccount.setPaymentDates([
            new Date(2001, 2, 22),
            new Date(2001, 1, 23),
            new Date(2001, 4, 19)
        ]);
        userAccount.setBalance(balanceStub);
        userAccount.setServices([serviceStub]);
    });

    const setupTariffs = tariffs => {
        userAccount.setServices([new MultiTariffServiceStub(tariffs)]);
    }

    const setupUncalculatedFees = uncalculatedFees => {
        calculationHistoryServiceStub = new CalculationHistoryServiceStub(uncalculatedFees);
        userAccount.setCalculationHistoryService(calculationHistoryServiceStub);
    }

    const verifyAppliedSum = expectedSum => {
        balanceStub.verifyUpdatedSum(expectedSum);
        calculationHistoryServiceStub.verifyAppliedSum(expectedSum);
    }

    it('should not apply payment when all fees already recalculated', () => {
        setupUncalculatedFees(new Map());

        userAccount.recalculateBalance();

        verifyAppliedSum(0);
    });

    it('should apply sum of all not calculated fees', () => {
        setupUncalculatedFees(new Map([
            [new Date(2001, 4, 20), 200],
            [new Date(2001, 5, 22), 150]
        ]));

        userAccount.recalculateBalance();

        verifyAppliedSum(350 * UNIT_RATE);
    });

    it('should apply sum for tariff with highest rate', () => {
        userAccount.setServices([multiTariffServiceStub]);
        setupUncalculatedFees(new Map([
            [new Date(2001, 4, 20), 200],
            [new Date(2001, 5, 22), 150]
        ]));

        userAccount.recalculateBalance();

        verifyAppliedSum(350);
    });

    it('should apply sum for tariff with additional fee for each uncalculated fee', () => {
        setupTariffs([new NoRateTariffStub(10), new NoRateTariffStub()]);
        setupUncalculatedFees(new Map([
            [new Date(2001, 4, 20), 200],
            [new Date(2001, 5, 22), 150]
        ]));

        userAccount.recalculateBalance();

        verifyAppliedSum(350 + 10 + 10);
    });

    it('should apply sum for tariff with additional fee when its higher then other tariff', () => {
        setupTariffs([new NoRateTariffStub(), new UnitBasedTariffStub(50)]);
        setupUncalculatedFees(new Map([
            [new Date(2001, 4, 20), 200]
        ]));

        userAccount.recalculateBalance();

        verifyAppliedSum(200 * UNIT_RATE + 50);
    });

    it('should apply sum for tariff with highest rate when its higher then other tariff', () => {
        setupTariffs([new NoRateTariffStub(), new UnitBasedTariffStub(10)]);
        setupUncalculatedFees(new Map([
            [new Date(2001, 4, 20), 200]
        ]));

        userAccount.recalculateBalance();

        verifyAppliedSum(200);
    });

    it('should apply sum of all not calculated fees for all services', () => {
        //given
        userAccount.setServices([new ServiceStub(), new SecondServiceStub()]);
        const calculationHistoryService = new CalculationHistoryForMultiServiceStub(
            new Map([
                [new Date(2001, 4, 20), 200]
            ]),
            new Map([
                [new Date(2001, 6, 25), 120],
                [new Date(2001, 5, 25), 180]
            ])
        );
        userAccount.setCalculationHistoryService(calculationHistoryService);

        //when
        userAccount.recalculateBalance();

        //then
        calculationHistoryService.verifyAppliedSumForService(200 * UNIT_RATE, ServiceStub);
        calculationHistoryService.verifyAppliedSumForService((120 + 180) * UNIT_RATE, SecondServiceStub);
        balanceStub.verifyUpdatedSum((200 + 120 + 180) * UNIT_RATE);
    });
});
