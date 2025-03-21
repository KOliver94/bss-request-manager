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
import { UserNestedList } from './user-nested-list';

/**
 *
 * @export
 * @interface RequestAdminList
 */
export interface RequestAdminList {
  /**
   *
   * @type {string}
   * @memberof RequestAdminList
   */
  created: string;
  /**
   *
   * @type {Array<UserNestedList>}
   * @memberof RequestAdminList
   */
  crew: Array<UserNestedList>;
  /**
   *
   * @type {string}
   * @memberof RequestAdminList
   */
  deadline: string;
  /**
   *
   * @type {number}
   * @memberof RequestAdminList
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof RequestAdminList
   */
  start_datetime: string;
  /**
   *
   * @type {number}
   * @memberof RequestAdminList
   */
  status: number;
  /**
   *
   * @type {boolean}
   * @memberof RequestAdminList
   */
  status_by_admin: boolean;
  /**
   *
   * @type {UserNestedList}
   * @memberof RequestAdminList
   */
  responsible: UserNestedList;
  /**
   *
   * @type {string}
   * @memberof RequestAdminList
   */
  title: string;
  /**
   *
   * @type {number}
   * @memberof RequestAdminList
   */
  video_count: number;
}
