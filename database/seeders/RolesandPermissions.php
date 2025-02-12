<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesandPermissions extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {

    $permissionData = [
      // SAY
      ['id' => '1', 'name' => 'xepsay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '2', 'name' => 'kehoachsay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '3', 'name' => 'vaolo', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '4', 'name' => 'kiemtralo', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '5', 'name' => 'losay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '6', 'name' => 'danhgiame', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // CBG
      ['id' => '7', 'name' => 'CBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '8', 'name' => 'CBG(CX)', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '9', 'name' => 'QCCBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // VCN
      ['id' => '10', 'name' => 'VCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '11', 'name' => 'VCN(CX)', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '12', 'name' => 'QCVCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // DAND
      ['id' => '13', 'name' => 'DAND', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '14', 'name' => 'DAND(CX)', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '15', 'name' => 'TDLDND', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // Manager
      ['id' => '16', 'name' => 'quanlyuser', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '17', 'name' => 'quanlyrole', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // REPORT
      ['id' => '18', 'name' => 'BCSAY_bienbanvaolo', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '19', 'name' => 'BCSAY_bienbanlichsuvaolo', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '20', 'name' => 'BCSAY_bienbankiemtralosay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '21', 'name' => 'BCSAY_kehoachsay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '22', 'name' => 'BCSAY_lodangsay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '23', 'name' => 'BCSAY_tonsaylua', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '24', 'name' => 'BCSAY_xepsay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '25', 'name' => 'BCSAY_xepchosay', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      ['id' => '26', 'name' => 'BCCBG_chitietgiaonhan', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '27', 'name' => 'BCCBG_xulyloi', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '28', 'name' => 'BCVCN_chitietgiaonhan', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '29', 'name' => 'BCVCN_xulyloi', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '30', 'name' => 'BCDAND_chitietgiaonhan', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '31', 'name' => 'BCDAND_xulyloi', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

      // QLHH
      ['id' => '32', 'name' => 'DCHH', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
    ];
    DB::table("permissions")->insert($permissionData);

    $roleData = [
      ['id' => '1', 'name' => 'Admin', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '2', 'name' => 'Giám đốc/phó giám đốc nhà máy', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '3', 'name' => 'Quản đốc/phó quản đốc', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '4', 'name' => 'Người giám sát', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '5', 'name' => 'Tổ trưởng/tổ phó CBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '6', 'name' => 'Tổ trưởng/tổ phó VCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '7', 'name' => 'Tổ trưởng/tổ phó DAND', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '8', 'name' => 'Nhóm trưởng/nhóm phó CBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '9', 'name' => 'Nhóm trưởng/nhóm phó VCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '10', 'name' => 'Nhóm trưởng/nhóm phó DAND', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '11', 'name' => 'Công nhân sấy', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '12', 'name' => 'Công nhân ghi nhận CBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '13', 'name' => 'Công nhân kiểm định CBG', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '14', 'name' => 'Công nhân ghi nhận VCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '15', 'name' => 'Công nhân kiểm định VCN', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '16', 'name' => 'Công nhân ghi nhận DAND', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '17', 'name' => 'Công nhân lắp đặt', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],
      ['id' => '18', 'name' => 'Thủ kho', 'guard_name' => 'web', 'created_at' => now(), 'updated_at' => now()],

    ];
    DB::table("roles")->insert($roleData);

    $rolesAndPermissionsData = [
      // Admin
      ['role_id' => '1', 'permission_id' => '1'],
      ['role_id' => '1', 'permission_id' => '2'],
      ['role_id' => '1', 'permission_id' => '3'],
      ['role_id' => '1', 'permission_id' => '4'],
      ['role_id' => '1', 'permission_id' => '5'],
      ['role_id' => '1', 'permission_id' => '6'],
      ['role_id' => '1', 'permission_id' => '7'],
      ['role_id' => '1', 'permission_id' => '9'],
      ['role_id' => '1', 'permission_id' => '10'],
      ['role_id' => '1', 'permission_id' => '12'],
      ['role_id' => '1', 'permission_id' => '13'],
      ['role_id' => '1', 'permission_id' => '15'],
      ['role_id' => '1', 'permission_id' => '16'],
      ['role_id' => '1', 'permission_id' => '17'],
      ['role_id' => '1', 'permission_id' => '18'],
      ['role_id' => '1', 'permission_id' => '19'],
      ['role_id' => '1', 'permission_id' => '20'],
      ['role_id' => '1', 'permission_id' => '21'],
      ['role_id' => '1', 'permission_id' => '22'],
      ['role_id' => '1', 'permission_id' => '23'],
      ['role_id' => '1', 'permission_id' => '24'],
      ['role_id' => '1', 'permission_id' => '25'],
      ['role_id' => '1', 'permission_id' => '26'],
      ['role_id' => '1', 'permission_id' => '27'],
      ['role_id' => '1', 'permission_id' => '28'],
      ['role_id' => '1', 'permission_id' => '29'],
      ['role_id' => '1', 'permission_id' => '30'],
      ['role_id' => '1', 'permission_id' => '31'],
      ['role_id' => '1', 'permission_id' => '32'],

      // Giám đốc/phó giám đốc
      ['role_id' => '2', 'permission_id' => '1'],
      ['role_id' => '2', 'permission_id' => '2'],
      ['role_id' => '2', 'permission_id' => '3'],
      ['role_id' => '2', 'permission_id' => '4'],
      ['role_id' => '2', 'permission_id' => '5'],
      ['role_id' => '2', 'permission_id' => '6'],
      ['role_id' => '2', 'permission_id' => '8'],
      ['role_id' => '2', 'permission_id' => '9'],
      ['role_id' => '2', 'permission_id' => '11'],
      ['role_id' => '2', 'permission_id' => '12'],
      ['role_id' => '2', 'permission_id' => '14'],
      ['role_id' => '2', 'permission_id' => '15'],
      ['role_id' => '2', 'permission_id' => '18'],
      ['role_id' => '2', 'permission_id' => '19'],
      ['role_id' => '2', 'permission_id' => '20'],
      ['role_id' => '2', 'permission_id' => '21'],
      ['role_id' => '2', 'permission_id' => '22'],
      ['role_id' => '2', 'permission_id' => '23'],
      ['role_id' => '2', 'permission_id' => '24'],
      ['role_id' => '2', 'permission_id' => '25'],
      ['role_id' => '2', 'permission_id' => '26'],
      ['role_id' => '2', 'permission_id' => '27'],
      ['role_id' => '2', 'permission_id' => '28'],
      ['role_id' => '2', 'permission_id' => '29'],
      ['role_id' => '2', 'permission_id' => '30'],
      ['role_id' => '2', 'permission_id' => '31'],

      //Quản đốc/phó quản đốc
      ['role_id' => '3', 'permission_id' => '1'],
      ['role_id' => '3', 'permission_id' => '2'],
      ['role_id' => '3', 'permission_id' => '3'],
      ['role_id' => '3', 'permission_id' => '4'],
      ['role_id' => '3', 'permission_id' => '5'],
      ['role_id' => '3', 'permission_id' => '6'],
      ['role_id' => '3', 'permission_id' => '8'],
      ['role_id' => '3', 'permission_id' => '9'],
      ['role_id' => '3', 'permission_id' => '11'],
      ['role_id' => '3', 'permission_id' => '12'],
      ['role_id' => '3', 'permission_id' => '14'],
      ['role_id' => '3', 'permission_id' => '15'],
      ['role_id' => '3', 'permission_id' => '18'],
      ['role_id' => '3', 'permission_id' => '19'],
      ['role_id' => '3', 'permission_id' => '20'],
      ['role_id' => '3', 'permission_id' => '21'],
      ['role_id' => '3', 'permission_id' => '22'],
      ['role_id' => '3', 'permission_id' => '23'],
      ['role_id' => '3', 'permission_id' => '24'],
      ['role_id' => '3', 'permission_id' => '25'],
      ['role_id' => '3', 'permission_id' => '26'],
      ['role_id' => '3', 'permission_id' => '27'],
      ['role_id' => '3', 'permission_id' => '28'],
      ['role_id' => '3', 'permission_id' => '29'],
      ['role_id' => '3', 'permission_id' => '30'],
      ['role_id' => '3', 'permission_id' => '31'],

      //Người giám sát
      ['role_id' => '4', 'permission_id' => '1'],
      ['role_id' => '4', 'permission_id' => '2'],
      ['role_id' => '4', 'permission_id' => '3'],
      ['role_id' => '4', 'permission_id' => '4'],
      ['role_id' => '4', 'permission_id' => '5'],
      ['role_id' => '4', 'permission_id' => '6'],
      ['role_id' => '4', 'permission_id' => '8'],
      ['role_id' => '4', 'permission_id' => '9'],
      ['role_id' => '4', 'permission_id' => '11'],
      ['role_id' => '4', 'permission_id' => '12'],
      ['role_id' => '4', 'permission_id' => '14'],
      ['role_id' => '4', 'permission_id' => '15'],
      ['role_id' => '4', 'permission_id' => '18'],
      ['role_id' => '4', 'permission_id' => '19'],
      ['role_id' => '4', 'permission_id' => '20'],
      ['role_id' => '4', 'permission_id' => '21'],
      ['role_id' => '4', 'permission_id' => '22'],
      ['role_id' => '4', 'permission_id' => '23'],
      ['role_id' => '4', 'permission_id' => '24'],
      ['role_id' => '4', 'permission_id' => '25'],
      ['role_id' => '4', 'permission_id' => '26'],
      ['role_id' => '4', 'permission_id' => '27'],
      ['role_id' => '4', 'permission_id' => '28'],
      ['role_id' => '4', 'permission_id' => '29'],
      ['role_id' => '4', 'permission_id' => '30'],
      ['role_id' => '4', 'permission_id' => '31'],

      //Tổ trưởng/tổ phó CBG
      ['role_id' => '5', 'permission_id' => '1'],
      ['role_id' => '5', 'permission_id' => '2'],
      ['role_id' => '5', 'permission_id' => '3'],
      ['role_id' => '5', 'permission_id' => '4'],
      ['role_id' => '5', 'permission_id' => '5'],
      ['role_id' => '5', 'permission_id' => '6'],
      ['role_id' => '5', 'permission_id' => '7'],
      ['role_id' => '5', 'permission_id' => '9'],
      ['role_id' => '5', 'permission_id' => '18'],
      ['role_id' => '5', 'permission_id' => '19'],
      ['role_id' => '5', 'permission_id' => '20'],
      ['role_id' => '5', 'permission_id' => '21'],
      ['role_id' => '5', 'permission_id' => '22'],
      ['role_id' => '5', 'permission_id' => '23'],
      ['role_id' => '5', 'permission_id' => '24'],
      ['role_id' => '5', 'permission_id' => '25'],
      ['role_id' => '5', 'permission_id' => '26'],
      ['role_id' => '5', 'permission_id' => '27'],

      //Tổ trưởng/tổ phó VCN
      ['role_id' => '6', 'permission_id' => '1'],
      ['role_id' => '6', 'permission_id' => '2'],
      ['role_id' => '6', 'permission_id' => '3'],
      ['role_id' => '6', 'permission_id' => '4'],
      ['role_id' => '6', 'permission_id' => '5'],
      ['role_id' => '6', 'permission_id' => '6'],
      ['role_id' => '6', 'permission_id' => '10'],
      ['role_id' => '6', 'permission_id' => '12'],
      ['role_id' => '6', 'permission_id' => '18'],
      ['role_id' => '6', 'permission_id' => '19'],
      ['role_id' => '6', 'permission_id' => '20'],
      ['role_id' => '6', 'permission_id' => '21'],
      ['role_id' => '6', 'permission_id' => '22'],
      ['role_id' => '6', 'permission_id' => '23'],
      ['role_id' => '6', 'permission_id' => '24'],
      ['role_id' => '6', 'permission_id' => '25'],
      ['role_id' => '6', 'permission_id' => '28'],
      ['role_id' => '6', 'permission_id' => '29'],

      //Tổ trưởng/tổ phó DAND
      ['role_id' => '7', 'permission_id' => '1'],
      ['role_id' => '7', 'permission_id' => '2'],
      ['role_id' => '7', 'permission_id' => '3'],
      ['role_id' => '7', 'permission_id' => '4'],
      ['role_id' => '7', 'permission_id' => '5'],
      ['role_id' => '7', 'permission_id' => '6'],
      ['role_id' => '7', 'permission_id' => '13'],
      ['role_id' => '7', 'permission_id' => '15'],
      ['role_id' => '7', 'permission_id' => '18'],
      ['role_id' => '7', 'permission_id' => '19'],
      ['role_id' => '7', 'permission_id' => '20'],
      ['role_id' => '7', 'permission_id' => '21'],
      ['role_id' => '7', 'permission_id' => '22'],
      ['role_id' => '7', 'permission_id' => '23'],
      ['role_id' => '7', 'permission_id' => '24'],
      ['role_id' => '7', 'permission_id' => '25'],
      ['role_id' => '7', 'permission_id' => '30'],
      ['role_id' => '7', 'permission_id' => '31'],

      // Nhóm trưởng/ nhóm phó CBG
      ['role_id' => '8', 'permission_id' => '1'],
      ['role_id' => '8', 'permission_id' => '2'],
      ['role_id' => '8', 'permission_id' => '3'],
      ['role_id' => '8', 'permission_id' => '4'],
      ['role_id' => '8', 'permission_id' => '5'],
      ['role_id' => '8', 'permission_id' => '6'],
      ['role_id' => '8', 'permission_id' => '7'],
      ['role_id' => '8', 'permission_id' => '9'],
      ['role_id' => '8', 'permission_id' => '18'],
      ['role_id' => '8', 'permission_id' => '19'],
      ['role_id' => '8', 'permission_id' => '20'],
      ['role_id' => '8', 'permission_id' => '21'],
      ['role_id' => '8', 'permission_id' => '22'],
      ['role_id' => '8', 'permission_id' => '23'],
      ['role_id' => '8', 'permission_id' => '24'],
      ['role_id' => '8', 'permission_id' => '25'],
      ['role_id' => '8', 'permission_id' => '26'],
      ['role_id' => '8', 'permission_id' => '27'],

      //Nhóm trưởng/ nhóm phó VCN
      ['role_id' => '9', 'permission_id' => '1'],
      ['role_id' => '9', 'permission_id' => '2'],
      ['role_id' => '9', 'permission_id' => '3'],
      ['role_id' => '9', 'permission_id' => '4'],
      ['role_id' => '9', 'permission_id' => '5'],
      ['role_id' => '9', 'permission_id' => '6'],
      ['role_id' => '9', 'permission_id' => '10'],
      ['role_id' => '9', 'permission_id' => '12'],
      ['role_id' => '9', 'permission_id' => '18'],
      ['role_id' => '9', 'permission_id' => '19'],
      ['role_id' => '9', 'permission_id' => '20'],
      ['role_id' => '9', 'permission_id' => '21'],
      ['role_id' => '9', 'permission_id' => '22'],
      ['role_id' => '9', 'permission_id' => '23'],
      ['role_id' => '9', 'permission_id' => '24'],
      ['role_id' => '9', 'permission_id' => '25'],
      ['role_id' => '9', 'permission_id' => '28'],
      ['role_id' => '9', 'permission_id' => '29'],

      // Nhóm trưởng/ nhóm phó DAND
      ['role_id' => '10', 'permission_id' => '13'],
      ['role_id' => '10', 'permission_id' => '15'],
      ['role_id' => '10', 'permission_id' => '18'],
      ['role_id' => '10', 'permission_id' => '19'],
      ['role_id' => '10', 'permission_id' => '20'],
      ['role_id' => '10', 'permission_id' => '21'],
      ['role_id' => '10', 'permission_id' => '22'],
      ['role_id' => '10', 'permission_id' => '23'],
      ['role_id' => '10', 'permission_id' => '24'],
      ['role_id' => '10', 'permission_id' => '25'],
      ['role_id' => '10', 'permission_id' => '30'],
      ['role_id' => '10', 'permission_id' => '31'],

      // Công nhân sấy
      ['role_id' => '11', 'permission_id' => '1'],
      ['role_id' => '11', 'permission_id' => '2'],
      ['role_id' => '11', 'permission_id' => '3'],
      ['role_id' => '11', 'permission_id' => '4'],
      ['role_id' => '11', 'permission_id' => '5'],
      ['role_id' => '11', 'permission_id' => '6'],
      ['role_id' => '11', 'permission_id' => '18'],
      ['role_id' => '11', 'permission_id' => '19'],
      ['role_id' => '11', 'permission_id' => '20'],
      ['role_id' => '11', 'permission_id' => '21'],
      ['role_id' => '11', 'permission_id' => '22'],
      ['role_id' => '11', 'permission_id' => '23'],
      ['role_id' => '11', 'permission_id' => '24'],
      ['role_id' => '11', 'permission_id' => '25'],

      //Công nhân ghi nhận CBG
      ['role_id' => '12', 'permission_id' => '7'],
      ['role_id' => '12', 'permission_id' => '26'],

      //Công nhân kiểm định CBG
      ['role_id' => '13', 'permission_id' => '9'],
      ['role_id' => '13', 'permission_id' => '27'],

      //Công nhân ghi nhận VCN
      ['role_id' => '14', 'permission_id' => '10'],
      ['role_id' => '14', 'permission_id' => '28'],

      //Công nhân kiểm định VCN
      ['role_id' => '15', 'permission_id' => '12'],
      ['role_id' => '15', 'permission_id' => '29'],

      //Công nhân ghi nhận DAND
      ['role_id' => '16', 'permission_id' => '13'],
      ['role_id' => '16', 'permission_id' => '30'],

      //Công nhân lắp đặt DAND
      ['role_id' => '17', 'permission_id' => '15'],
      ['role_id' => '17', 'permission_id' => '31'],

      ['role_id' => '17', 'permission_id' => '32'],

    ];
    DB::table("role_has_permissions")->insert($rolesAndPermissionsData);
  }
}
