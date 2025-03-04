import axios from "axios";
import { Agreement } from "./Agreement";

export const postData = async (
  token: string | null, url: string,
  app_name: string,
  company_name: string | null | undefined,
  agreements: Agreement[]
) => {
  const formData = new FormData();

  // Append each blob with a filename
  agreements.forEach((agreement, index) => {
    if (agreement.blob) {
      formData.append(`agreement-${agreement.id}`, agreement.blob, `agreement-${agreement.id}.pdf`);
    }
  });

  // Append other data as form fields
  formData.append('app_name', app_name);
  formData.append('company_name', company_name || '');
  formData.append(
    'agreement_ids', JSON.stringify(agreements.map(agreement => agreement.id))
  );

  // Send the request with Axios
  return await axios.post(url, formData, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'multipart/form-data'
    },
  });
}