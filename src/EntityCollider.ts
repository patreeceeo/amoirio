import { DeprecatedEntity } from './Entity'

export class EntityCollider {
  constructor(public entities: Set<DeprecatedEntity>) {}

  check(subject: DeprecatedEntity) {
    for (const candidate of this.entities) {
      if (subject === candidate) continue

      if (subject.bounds.overlaps(candidate.bounds)) {
        subject.collides(candidate)
      }
    }
  }
}
