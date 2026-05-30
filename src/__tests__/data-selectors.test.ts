import { describe, expect, it } from "vitest";
import { getMasterChefsOmakaseExperience, getReservationExperiences } from "../data/selectors";

describe("data selectors", () => {
  it("maps reservation ambience roles to the corrected dining room and sushi bar images", () => {
    const experiences = getReservationExperiences();
    const diningRoom = experiences.find((experience) => experience.id === "main-dining-room");
    const sushiBar = experiences.find((experience) => experience.id === "sushi-bar");

    expect(diningRoom?.image.experienceId).toBe("main-dining-room");
    expect(sushiBar?.image.experienceId).toBe("sushi-bar");
  });

  it("keeps appetizer, specialty, and dessert assets scoped to master chefs omakase", () => {
    const experience = getMasterChefsOmakaseExperience();
    const coursePaths = experience.courses.flatMap((course) => [
      course.appetizer.image.publicUrl,
      course.specialty.image.publicUrl,
      course.dessert.image.publicUrl,
    ]);

    expect(experience.courses).toHaveLength(4);
    expect(coursePaths.every((publicUrl) => publicUrl.startsWith("/assets/omakase/"))).toBe(true);
  });
});
