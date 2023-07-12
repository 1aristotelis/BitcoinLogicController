import {
    PubKey,
    ByteString,
    hash256,
    assert,
    SmartContract,
    method,
    prop,
    Sig,
    SigHash,
} from 'scrypt-ts'

export class DigitalInput extends SmartContract {
    @prop()
    device: PubKey
    @prop()
    engineer: PubKey
    @prop()
    invert: boolean
    @prop()
    offTimeDelay: bigint // Pv off time delay (pv from 1 to 0) [s]
    @prop()
    onTimeDelay: bigint // Pv on time delay (pv from 0 to 1) [s]
    @prop(true)
    value: boolean // process value
    @prop(true)
    fieldValue: boolean // raw from device
    @prop(true)
    simValue: boolean // simulated/forced by engineer
    @prop(true)
    badSignal: boolean
    @prop(true)
    isSim: boolean

    constructor(
        device: PubKey,
        engineer: PubKey,
        invert: boolean,
        offTimeDelay: bigint,
        onTimeDelay: bigint
    ) {
        super(...arguments)
        this.device = device
        this.engineer = engineer
        this.invert = invert
        this.offTimeDelay = offTimeDelay
        this.onTimeDelay = onTimeDelay
        this.value = false
        this.fieldValue = false
        this.simValue = false
        this.badSignal = false
        this.isSim = false
    }

    @method()
    updateValue(newValue: boolean): void {
        //from True to False
        if (this.value && !newValue) {
            if (this.offTimeDelay > 0) {
                setTimeout(
                    () => (this.value = this.invert ? !newValue : newValue),
                    Number(this.offTimeDelay) / 1000
                )
            }
        }
        //from False to True
        if (!this.value && newValue) {
            if (this.onTimeDelay > 0) {
                setTimeout(
                    () => (this.value = this.invert ? !newValue : newValue),
                    Number(this.offTimeDelay) / 1000
                )
            }
        }
    }

    // ANYONECANPAY_SINGLE is used here to ignore all inputs and outputs, other than the ones contains the state
    // see https://scrypt.io/scrypt-ts/getting-started/what-is-scriptcontext#sighash-type
    @method(SigHash.ANYONECANPAY_SINGLE)
    public updateFieldValue(newValue: boolean, sig: Sig) {
        assert(!this.isSim, 'the device is in simulation mode')

        assert(this.checkSig(sig, this.device), 'checkSig device failed')
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
    public simulateValue(newValue: boolean, sig: Sig) {
        assert(this.isSim, 'the device is not in simulation mode')

        assert(this.checkSig(sig, this.engineer), 'checkSig engineer failed')
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
