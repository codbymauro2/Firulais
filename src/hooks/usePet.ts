import { useState, useEffect } from "react";
import { fetchPetById, type Pet } from "../lib/petsService";

export function usePet(id: string | undefined) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    fetchPetById(id)
      .then(setPet)
      .finally(() => setIsLoading(false));
  }, [id]);

  return { pet, isLoading };
}
