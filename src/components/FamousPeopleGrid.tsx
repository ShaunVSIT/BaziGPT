import React from "react";
import { FamousPerson } from "@/types/famous";
import FamousPersonCard from "./FamousPersonCard";

const FamousPeopleGrid: React.FC<{ people: FamousPerson[] }> = ({ people }) => (
  <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {people.map((person) => (
      <FamousPersonCard key={person.id} person={person} />
    ))}
  </div>
);

export default FamousPeopleGrid;
