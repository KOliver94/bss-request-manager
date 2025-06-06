/* tslint:disable */
/* eslint-disable */
/**
 * BSS Request Manager API
 * REST API for Workflow Support System for managing video shooting, filming and live streaming requests of Budavári Schönherz Stúdió.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: kecskemety.oliver@simonyi.bme.hu
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 *
 * @export
 * @interface RequestList
 */
export interface RequestList {
  /**
   *
   * @type {string}
   * @memberof RequestList
   */
  created: string;
  /**
   *
   * @type {number}
   * @memberof RequestList
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof RequestList
   */
  start_datetime: string;
  /**
   *
   * @type {number}
   * @memberof RequestList
   */
  status: number;
  /**
   *
   * @type {string}
   * @memberof RequestList
   */
  title: string;
}
