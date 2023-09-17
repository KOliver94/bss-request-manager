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

// May contain unused imports in some cases
// @ts-ignore
import { UserNestedList } from './user-nested-list';

/**
 *
 * @export
 * @interface VideoAdminList
 */
export interface VideoAdminList {
  /**
   *
   * @type {number}
   * @memberof VideoAdminList
   */
  avg_rating: number;
  /**
   *
   * @type {UserNestedList}
   * @memberof VideoAdminList
   */
  editor: UserNestedList;
  /**
   *
   * @type {number}
   * @memberof VideoAdminList
   */
  id: number;
  /**
   *
   * @type {boolean}
   * @memberof VideoAdminList
   */
  rated: boolean;
  /**
   *
   * @type {number}
   * @memberof VideoAdminList
   */
  status: number;
  /**
   *
   * @type {boolean}
   * @memberof VideoAdminList
   */
  status_by_admin: boolean;
  /**
   *
   * @type {string}
   * @memberof VideoAdminList
   */
  title: string;
}