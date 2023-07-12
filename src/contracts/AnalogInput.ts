import {
    assert,
    PubKey,
    SigHash,
    ByteString,
    hash256,
    Sig,
    SmartContract,
    method,
    prop,
} from 'scrypt-ts'

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
        this.value = 0n
        this.fieldValue = 0n
        this.simValue = 0n
        this.badSignal = false
        this.isSim = false
    }

    @method()
    updateValue(newValue: bigint): void {
        this.value = newValue
    }

    // ANYONECANPAY_SINGLE is used here to ignore all inputs and outputs, other than the ones contains the state
    // see https://scrypt.io/scrypt-ts/getting-started/what-is-scriptcontext#sighash-type
    @method(SigHash.ANYONECANPAY_SINGLE)
    public updateFieldValue(newValue: bigint, sig: Sig) {
        assert(!this.isSim, 'the device is in simulation mode')

        assert(this.checkSig(sig, this.device), `checkSig device failed`)
        this.fieldValue = newValue
        this.updateValue(this.fieldValue)

        assert(true, 'field value updated')

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // outputs containing the latest state and an optional change output
        const outputs: ByteString =
            this.buildStateOutput(amount) + this.buildChangeOutput()
        // verify unlocking tx has the same outputs
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    // ANYONECANPAY_SINGLE is used here to ignore all inputs and outputs, other than the ones contains the state
    // see https://scrypt.io/scrypt-ts/getting-started/what-is-scriptcontext#sighash-type
    @method(SigHash.ANYONECANPAY_SINGLE)
    public setSimulationMode(simMode: boolean, sig: Sig) {
        assert(this.checkSig(sig, this.engineer), 'checkSig failed')
        this.isSim = simMode
        assert(true, `simulation is ${this.isSim ? 'on' : 'off'}`)

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // outputs containing the latest state and an optional change output
        const outputs: ByteString =
            this.buildStateOutput(amount) + this.buildChangeOutput()
        // verify unlocking tx has the same outputs
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }

    // ANYONECANPAY_SINGLE is used here to ignore all inputs and outputs, other than the ones contains the state
    // see https://scrypt.io/scrypt-ts/getting-started/what-is-scriptcontext#sighash-type
    @method(SigHash.ANYONECANPAY_SINGLE)
    public simulateValue(newValue: bigint, sig: Sig) {
        assert(this.isSim, 'the device is not in simulation mode')

        assert(this.checkSig(sig, this.engineer), `checkSig engineer failed`)
        this.simValue = newValue
        this.updateValue(this.simValue)

        assert(true, 'simulated value updated')

        // make sure balance in the contract does not change
        const amount: bigint = this.ctx.utxo.value
        // outputs containing the latest state and an optional change output
        const outputs: ByteString =
            this.buildStateOutput(amount) + this.buildChangeOutput()
        // verify unlocking tx has the same outputs
        assert(this.ctx.hashOutputs == hash256(outputs), 'hashOutputs mismatch')
    }
}
