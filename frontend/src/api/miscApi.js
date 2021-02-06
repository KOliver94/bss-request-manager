import axiosInstance from './apiUtils';

/*
 * Contact API call
 */
export default async function sendContactMessage(messageData) {
  return axiosInstance.post('/misc/contact', messageData);
}
