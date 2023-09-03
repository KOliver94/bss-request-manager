/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 0.1.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * @export
 * @interface RequestExternalSchEventsCreateRequest
 */
export interface RequestExternalSchEventsCreateRequest {
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  callback_url: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  comment?: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  end_datetime: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  place: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  requester_first_name: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  requester_email: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  requester_last_name: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  requester_mobile: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  start_datetime: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  title: string;
  /**
   *
   * @type {string}
   * @memberof RequestExternalSchEventsCreateRequest
   */
  type: string;
}
