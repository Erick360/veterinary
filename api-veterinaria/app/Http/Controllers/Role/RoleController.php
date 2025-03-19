<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
//use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $roles = Role::where('name', 'ilike', "%".$search."%")->orderBy('id','desc')->get();
        return response()->json([
            "roles" => $roles->map(function($role){
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    //'guard_name' => $role->guard_name,
                    'created_at' => $role->created_at->format("Y-m-d h:i:s"),
                    'permissions' => $role->permissions,
                    //'updated_at' => $role->updated_at
                    "permissions_pluck" => $role->permissions->pluck('name'),
                ];
            })
            ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $exist_role = Role::where("name", $request->name)->first();
        if($exist_role){
            return response()->json(["message" => "The role already exists"], 400);
        }

        $role = Role::create([
            "name" => $request->name,
            "guard_name" => "api",
        ]);

        foreach($request->permissions as $key => $permission){
            //$role->givePermissionTo($permission);
            $role->givePermissionTo($permission);
        }

        return response()->json(["message" => "Role created successfully"], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $exist_role = Role::where("name", $request->name)->where("id","<>",$id)->first();
        if($exist_role){
            return response()->json(["message" => "The role name already exists"], 400);
        }

        $role = Role::findOrFail($id);
        $role->update([
            "name" => $request->name,
            "guard_name" => "api",
        ]);

    
        $role->syncPerrrmissions($request->permissions);

        return response()->json(["message" => "Role created successfully"], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(["message" => "Role deleted successfully"], 200);
    }
}
