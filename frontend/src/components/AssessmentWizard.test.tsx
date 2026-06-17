import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentWizard } from './AssessmentWizard';
import { HousingSection } from './wizard/HousingSection';
import { TransportSection } from './wizard/TransportSection';

describe('AssessmentWizard Component', () => {
  it('renders correctly and handles interactions across sections', () => {
    const onComplete = vi.fn();
    render(<AssessmentWizard onComplete={onComplete} />);

    // Preset Selector
    const lowImpactBtn = screen.getByText('Eco Champion');
    fireEvent.click(lowImpactBtn);
    
    const medImpactBtn = screen.getByText('Balanced Citizen');
    fireEvent.click(medImpactBtn);
    
    const highImpactBtn = screen.getByText('Carbon Heavy');
    fireEvent.click(highImpactBtn);

    // Housing Section (Sliders & numbers)
    const elecInput = screen.getByRole('spinbutton', { name: /Monthly Electricity/i });
    fireEvent.change(elecInput, { target: { value: '500' } });

    // Transport Section
    const evRadioBtn = screen.getByRole('radio', { name: 'EV ⚡' });
    fireEvent.click(evRadioBtn);

    const incShortFlights = screen.getByRole('button', { name: 'Increase Short (<3h)' });
    fireEvent.click(incShortFlights);
    fireEvent.click(incShortFlights);

    const decShortFlights = screen.getByRole('button', { name: 'Decrease Short (<3h)' });
    fireEvent.click(decShortFlights);

    const carKmInput = screen.getByLabelText(/Weekly Car Travel/i);
    fireEvent.change(carKmInput, { target: { value: '100' } });
    fireEvent.change(carKmInput, { target: { value: '' } });

    const transitKmInput = screen.getByLabelText(/Weekly Transit Travel/i);
    fireEvent.change(transitKmInput, { target: { value: '50' } });
    fireEvent.change(transitKmInput, { target: { value: '' } });

    // Consumption Section
    const veganRadioBtn = screen.getByRole('radio', { name: 'Vegan 🌱' });
    fireEvent.click(veganRadioBtn);

    const shoppingInput = screen.getByLabelText(/Monthly Shopping Spend/i);
    fireEvent.change(shoppingInput, { target: { value: '200' } });
    fireEvent.change(shoppingInput, { target: { value: '' } });

    // Housing Inputs (Number and Empty)
    const gasInput = screen.getByRole('spinbutton', { name: /Monthly Gas/i });
    fireEvent.change(gasInput, { target: { value: '30' } });
    fireEvent.change(gasInput, { target: { value: '' } });

    const wasteInput = screen.getByRole('spinbutton', { name: /Weekly Waste/i });
    fireEvent.change(wasteInput, { target: { value: '10' } });
    fireEvent.change(wasteInput, { target: { value: '' } });
    
    const recycleRate = screen.getByRole('slider', { name: /Recycling Rate/i });
    fireEvent.change(recycleRate, { target: { value: '50' } });

    const elecInputEmpty = screen.getByRole('spinbutton', { name: /Monthly Electricity/i });
    fireEvent.change(elecInputEmpty, { target: { value: '' } });



    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Calculate Impact/i });
    fireEvent.click(submitBtn);

    expect(onComplete).toHaveBeenCalled();
    const finalInput = onComplete.mock.calls[0][0];
    
    expect(finalInput.housing.electricityKwh).toBeNull();
    expect(finalInput.transport.carType).toBe('ev');
    expect(finalInput.transport.flightsShort).toBe(5); // Default is 4 in Carbon Heavy. 4 + 2 - 1 = 5
    expect(finalInput.consumption.diet).toBe('vegan');
    expect(finalInput.transport.carKm).toBeNull();
    expect(finalInput.transport.transitKm).toBeNull();
    expect(finalInput.consumption.shoppingSpent).toBeNull();
  });

  it('HousingSection falls back to 0 for missing recycleRate', () => {
    render(<HousingSection values={{}} onChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveValue('0');
  });


  it('TransportSection falls back to 0 for missing flights', () => {
    render(<TransportSection values={{}} onChange={vi.fn()} />);
    const shortFlights = screen.getAllByRole('textbox')[0];
    expect(shortFlights).toHaveValue('0');
  });

});


