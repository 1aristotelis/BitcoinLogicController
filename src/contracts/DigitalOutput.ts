import { assert, SmartContract, prop, PubKey, method } from 'scrypt-ts'

export class DigitalOutput extends SmartContract {
    @prop()
    device: PubKey
    @prop(true)
    setPoint: boolean
    @prop()
    outputMode: bigint // Mode of output (0-continuous out; 1-inverted continuous out; 2-on pulse; 3-off pulse; 4- cyclic on and off pulse; 5-delayed continuous)
    @prop()
    onPulseTime: bigint // Determines the duration of the pulse at 1
    @prop()
    offPulseTime: bigint // Determines the duration of the pulse at 0
    @prop()
    delayOnTime: bigint // Determines the delay when output switches to On
    @prop()
    delayOffTime: bigint // Determines the delay when output switches to Off
    @prop()
    disableDelay: boolean

    constructor(
        device: PubKey,
        outputMode: bigint,
        onPulseTime: bigint,
        offPulseTime: bigint,
        delayOnTime: bigint,
        delayOffTime: bigint,
        disableDelay: boolean
    ) {
        super(...arguments)
        this.device = device
        this.setPoint = false
        this.outputMode = outputMode > 5n ? 1n : outputMode
        this.onPulseTime = onPulseTime
        this.offPulseTime = offPulseTime
        this.delayOnTime = delayOnTime
        this.delayOffTime = delayOffTime
        this.disableDelay = disableDelay
    }

    @method()
    public updateSetPoint(newValue: boolean) {
        assert(true, 'did not update setPoint')
    }
}
