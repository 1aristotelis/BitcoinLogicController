import { assert } from 'console'
import { PubKey, PubKeyHash, Sig, SmartContract, method, prop } from 'scrypt-ts'

// https://automationforum.co/instrumentation-basics-measurement-technology/
// https://instrumentationtools.com/scaling-sensor-output-to-engineering-units/

// Y=MX+B
// Where Y is the output or ENGINEERING UNITS
// Where M is the slope or the SCALE FACTOR
// Where X is the INPUT (millivolts, volts, etc) and
// Where B is the OFFSET

// Raw Signal ('-20mA, 1-5V, +-5V, 3-15psi) <=> Engineering Units (integer points) <=> Process Value (°C, Pa, m3/s ...)

export class AnalogInput extends SmartContract {
    @prop()
    device: PubKey
    @prop()
    engineer: PubKey
    @prop(true)
    value: bigint // in Engineering Units
    @prop(true)
    fieldValue: bigint // From Device in Engineering Units
    @prop(true)
    simValue: bigint // Forced Value in Engineering Units
    @prop(true)
    badSignal: boolean
    @prop(true)
    isSim: boolean
    @prop()
    factor: bigint // Scale Factor
    @prop()
    offset: bigint // Offset

    constructor(
        device: PubKey,
        engineer: PubKey,
        factor: bigint,
        offset: bigint
    ) {
        super(...arguments)
        this.device = device
        this.engineer = engineer
        this.factor = factor
        this.offset = offset
    }

    @method()
    updateValue(newValue): void {
        this.value = newValue
    }

    @method()
    public updateFieldValue(fieldValue: bigint, sig: Sig) {
        const isSim = this.isSim
        assert(!isSim, 'the device is in simulation mode')

        assert(this.checkSig(sig, this.device), `checkSig failed`)

        assert(true, 'field value updated')
    }

    @method()
    public simulateValue(sig: Sig) {
        assert(true, 'value simulated')
    }
}
