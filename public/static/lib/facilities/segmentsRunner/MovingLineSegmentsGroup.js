class MovingLineSegment{constructor(e,t,n){this.start=e,this.end=t,this.speed=n}getLength(){this.start.distanceTo(this.end)}getDirectionNormal(){return this.end.clone().sub(this.start).normalize()}}export default class MovingLineSegmentsGroup{constructor(){this.segments=[]}addSegment(e,t,n){let s;if(this.segments.length){let t=this.segments[this.segments.length-1].end;e.equals(t)||(console.warn("[MovingLineSegmentsGroup] the new segment line is not connected with last one, automatic correct it to the last endpoint"),e=t.clone())}s=new MovingLineSegment(e,t,n),this.segments.push(s)}chainWithLastEndpoint(e,t){let n=this.segments[this.segments.length-1].start.clone();this.addSegment(n,e,t)}closeSegments(e){let t=this.segments[this.segments.length-1],n=this.segments[0],s=t.start.clone(),i=n.start.clone();this.addSegment(s,i,e)}getSegmentAtIndex(e){if(!Number.isInteger(e))throw new TypeError("[MovingLineSegmentsGroup] index must be a integer");if(e>this.segments.length-1)throw new RangeError("[MovingLineSegmentsGroup] index out of bound");return this.segments[e]}getSegmentsCount(){return this.segments.length}}