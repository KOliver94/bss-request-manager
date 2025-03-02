import axiosInstance from 'api/apiUtils';

/*
 * Contact API call
 */
export default async function sendContactMessage(messageData) {
  return axiosInstance.post('/misc/contact', messageData);
}
