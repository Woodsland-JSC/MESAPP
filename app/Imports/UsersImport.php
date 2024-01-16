<?php

namespace App\Imports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;

class UsersImport implements ToModel
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {

        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        if($input['email'] == null){
            $input['email'] = $input['username'].'@wl.com';
        };
        $user = User::create($input);
        return new User($input);
    }
}
