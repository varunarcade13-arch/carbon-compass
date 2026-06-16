import React, { useState, useCallback } from 'react';
import { AssessmentInput, DEFAULT_INPUTS } from '../../../backend/src/services/calculatorService';
import { CheckCircle2 } from 'lucide-react';
import { PresetSelector } from './wizard/PresetSelector';
import { HousingSection } from './wizard/HousingSection';
import { TransportSection } from './wizard/TransportSection';
import { ConsumptionSection } from './wizard/ConsumptionSection';
import { WizardInputs, HousingInputs, TransportInputs, ConsumptionInputs } from './wizard/types';

interface AssessmentWizardProps {
  onComplete: (input: AssessmentInput) => void;
}

export function AssessmentWizard({ onComplete }: AssessmentWizardProps) {
  const [inputs, setInputs] = useState<WizardInputs>({
    housing: {
      electricityKwh: DEFAULT_INPUTS.electricityKwh,
      gasTherms: DEFAULT_INPUTS.gasTherms,
      wasteKg: DEFAULT_INPUTS.wasteKg,
      recycleRate: DEFAULT_INPUTS.recycleRate,
    },
    transport: {
      carKm: DEFAULT_INPUTS.carKm,
      carType: DEFAULT_INPUTS.carType,
      transitKm: DEFAULT_INPUTS.transitKm,
      flightsShort: DEFAULT_INPUTS.flightsShort,
      flightsMedium: DEFAULT_INPUTS.flightsMedium,
      flightsLong: DEFAULT_INPUTS.flightsLong,
    },
    consumption: {
      diet: DEFAULT_INPUTS.diet,
      shoppingSpent: DEFAULT_INPUTS.shoppingSpent,
    },
  });

  const updateHousing = useCallback(<K extends keyof HousingInputs>(key: K, val: HousingInputs[K]) => {
    setInputs((prev) => ({
      ...prev,
      housing: { ...prev.housing, [key]: val },
    }));
  }, []);

  const updateTransport = useCallback(<K extends keyof TransportInputs>(key: K, val: TransportInputs[K]) => {
    setInputs((prev) => ({
      ...prev,
      transport: { ...prev.transport, [key]: val },
    }));
  }, []);

  const updateConsumption = useCallback(<K extends keyof ConsumptionInputs>(key: K, val: ConsumptionInputs[K]) => {
    setInputs((prev) => ({
      ...prev,
      consumption: { ...prev.consumption, [key]: val },
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(inputs);
  };

  return (
    <div className="card" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <PresetSelector onSelect={setInputs} />
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <HousingSection values={inputs.housing} onChange={updateHousing} />
          <TransportSection values={inputs.transport} onChange={updateTransport} />
          <ConsumptionSection values={inputs.consumption} onChange={updateConsumption} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px' }}>
            Calculate Impact <CheckCircle2 size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
