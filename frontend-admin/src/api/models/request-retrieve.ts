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

// May contain unused imports in some cases
// @ts-ignore
import { UserNestedDetail } from './user-nested-detail';
// May contain unused imports in some cases
// @ts-ignore
import { UserNestedList } from './user-nested-list';

/**
 *
 * @export
 * @interface RequestRetrieve
 */
export interface RequestRetrieve {
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  created: string;
  /**
   *
   * @type {number}
   * @memberof RequestRetrieve
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  start_datetime: string;
  /**
   *
   * @type {number}
   * @memberof RequestRetrieve
   */
  status: number;
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  title: string;
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  end_datetime: string;
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  place: string;
  /**
   *
   * @type {UserNestedDetail}
   * @memberof RequestRetrieve
   */
  requester: UserNestedDetail;
  /**
   *
   * @type {UserNestedList}
   * @memberof RequestRetrieve
   */
  requested_by: UserNestedList;
  /**
   *
   * @type {UserNestedDetail}
   * @memberof RequestRetrieve
   */
  responsible: UserNestedDetail;
  /**
   *
   * @type {string}
   * @memberof RequestRetrieve
   */
  type: string;
}
