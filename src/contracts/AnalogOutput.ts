import { assert, SmartContract, prop, PubKey, method } from 'scrypt-ts'

export class AnalogOutput extends SmartContract {
    @prop()
    device: PubKey
    @prop(true)
    setPoint: bigint
    @prop(true)
    interlockSetPoint: bigint
    @prop(true)
    interlockActive: boolean
    @prop()
    factor: bigint // Scale Factor
    @prop()
    offset: bigint // Offset
    @prop(true)
    oos: boolean
    @prop()
    trackInterlockSetPoint: boolean

    constructor(
        device: PubKey,
        interlockSetPoint: bigint,
        factor: bigint,
        offset: bigint,
        trackInterlockSetPoint: boolean
    ) {
        super(...arguments)
        this.device = device
        this.setPoint = 0n
        this.interlockSetPoint = interlockSetPoint
        this.interlockActive = false
        this.factor = factor
        this.offset = offset
        this.oos = false
        this.trackInterlockSetPoint = trackInterlockSetPoint
    }

    @method()
    public udpateSetPoint(newValue: bigint) {
        assert(true, 'did not update setPoint')
    }
}
