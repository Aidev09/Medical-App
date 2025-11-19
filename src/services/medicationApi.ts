export async function patchMedicationTaken(id: string, taken: boolean) {
  const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taken }),
  });
  if (!response.ok) {
    throw new Error('Failed to update medication status');
  }
  return response.json();
}

export async function deleteMedication(id: string) {
  const response = await fetch(`http://127.0.0.1:8000/medications/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete medication');
  }
  return true;
} 