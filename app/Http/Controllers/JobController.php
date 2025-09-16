<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
class JobController extends Controller
{
     public function index()
    {
       $failedJobs = DB::table('failed_jobs')->orderBy('id', 'desc')->paginate(15, ['*'], 'failed_page');
        $jobs = DB::table('jobs')->orderBy('id', 'desc')->paginate(15, ['*'], 'jobs_page');

        return view('jobs.index', compact('failedJobs', 'jobs'));
    }

    public function retry(Request $request)
    {
        $ids = $request->input('ids', []);

        if (!empty($ids)) {
            $failedJobs = DB::table('failed_jobs')->whereIn('id', $ids)->get();

            foreach ($failedJobs as $job) {
                // Insert lại vào bảng jobs
                DB::table('jobs')->insert([
                    'queue' => $job->queue,
                    'payload' => $job->payload,
                    'attempts' => 0,
                    'available_at' => now()->timestamp,
                    'created_at' => now()->timestamp,
                ]);

                // Xóa khỏi failed_jobs
                DB::table('failed_jobs')->where('id', $job->id)->delete();
            }
        }

        return redirect()->route('jobs.index')->with('success', 'Đã retry thành công');
    }
    public function delete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (!empty($ids)) {
            DB::table('failed_jobs')->whereIn('id', $ids)->delete();
        }

        return redirect()->route('jobs.index')->with('success', 'Đã xóa job thất bại thành công');
    }
    public function retryAll()
{
    $failedJobs = DB::table('failed_jobs')->get();

    foreach ($failedJobs as $job) {
        // Đưa job lại vào bảng jobs
        DB::table('jobs')->insert([
            'queue'       => $job->queue,
            'payload'     => $job->payload,
            'attempts'    => 0,
            'available_at'=> now()->timestamp,
            'created_at'  => now()->timestamp,
        ]);

        // Xóa job khỏi bảng failed_jobs
        DB::table('failed_jobs')->where('id', $job->id)->delete();
    }

    return redirect()->route('jobs.index')->with('success', 'Đã retry toàn bộ job thất bại');
}


}
