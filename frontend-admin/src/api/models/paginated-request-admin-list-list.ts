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
import { PaginatedRequestAdminListListLinks } from './paginated-request-admin-list-list-links';
// May contain unused imports in some cases
// @ts-ignore
import { RequestAdminList } from './request-admin-list';

/**
 *
 * @export
 * @interface PaginatedRequestAdminListList
 */
export interface PaginatedRequestAdminListList {
  /**
   *
   * @type {number}
   * @memberof PaginatedRequestAdminListList
   */
  count?: number;
  /**
   *
   * @type {PaginatedRequestAdminListListLinks}
   * @memberof PaginatedRequestAdminListList
   */
  links?: PaginatedRequestAdminListListLinks;
  /**
   *
   * @type {Array<RequestAdminList>}
   * @memberof PaginatedRequestAdminListList
   */
  results?: Array<RequestAdminList>;
  /**
   *
   * @type {number}
   * @memberof PaginatedRequestAdminListList
   */
  total_pages?: number;
}
