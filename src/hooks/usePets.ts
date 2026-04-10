import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fetchPets, type Pet } from "../lib/petsService";

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchPets()
      .then(setPets)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

    // Actualización en tiempo real
    const channel = supabase
      .channel("pets-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "pets" }, () => {
        fetchPets().then(setPets).catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { pets, isLoading, error };
}
