<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Job Manager</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-900">
<div class="container mx-auto py-6">

    {{-- Alert --}}
    @if(session('success'))
        <div class="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {{ session('success') }}
        </div>
    @endif

    {{-- ================= FAILED JOBS ================= --}}
    <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-3 border-b border-red-300 bg-red-600 text-white rounded-t-lg flex justify-between items-center">
            <h2 class="text-lg font-semibold">❌ Failed Jobs</h2>
        </div>
        <div class="p-6">
            <form id="failed-form" method="POST">
                @csrf
                <div class="flex gap-2 mb-4">
                    <button formaction="{{ route('jobs.retry') }}"
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        🔄 Retry Selected
                    </button>
                     <button formaction="{{ route('jobs.retryAll') }}"
                            class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            onclick="return confirm('Bạn có chắc chắn muốn retry toàn bộ job thất bại không?')">
                        🔁 Retry All
                    </button>
                    <button formaction="{{ route('jobs.delete') }}"
                            class="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                            onclick="return confirm('Bạn có chắc chắn muốn xóa các job đã chọn không?')">
                        🗑 Delete Selected
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-100">
                        <tr>
                            <th class="px-3 py-2"><input type="checkbox" id="check-all"></th>
                            <th class="px-3 py-2 text-left">ID</th>
                            <th class="px-3 py-2 text-left">UUID</th>
                            <th class="px-3 py-2 text-left">Payload</th>
                            <th class="px-3 py-2 text-left">Exception</th>
                            <th class="px-3 py-2 text-left">Failed At</th>
                        </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                        @forelse($failedJobs as $job)
                            <tr class="hover:bg-red-50">
                                <td class="px-3 py-2">
                                    <input type="checkbox" name="ids[]" value="{{ $job->id }}">
                                </td>
                                <td class="px-3 py-2">{{ $job->id }}</td>
                                <td class="px-3 py-2">{{ $job->uuid }}</td>
                                <td class="px-3 py-2">
                                    <pre class="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{{ Str::limit($job->payload, 200) }}</pre>
                                     <div class="absolute z-10 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-md">
                                        {{ $job->payload }}
                                    </div>
                                </td>
                                <td class="px-3 py-2 relative group">
                                    <pre class="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{{ Str::limit($job->exception, 200) }}</pre>
                                    <div class="absolute z-10 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-md">
                                        {{ $job->exception }}
                                    </div>
                                </td>

                                <td class="px-3 py-2">{{ $job->failed_at }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-3 py-4 text-center text-gray-500">✅ Không có job lỗi nào</td>
                            </tr>
                        @endforelse
                        </tbody>
                    </table>
                </div>

                {{-- Pagination --}}
                <div class="mt-4">
                    {{ $failedJobs->links() }}
                </div>
            </form>
        </div>
    </div>

    {{-- ================= ACTIVE JOBS ================= --}}
    <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-3 border-b border-green-300 bg-green-600 text-white rounded-t-lg">
            <h2 class="text-lg font-semibold">✅ Active Jobs</h2>
        </div>
        <div class="p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-gray-100">
                    <tr>
                        <th class="px-3 py-2 text-left">ID</th>
                        <th class="px-3 py-2 text-left">Queue</th>
                        <th class="px-3 py-2 text-left">Payload</th>
                        <th class="px-3 py-2 text-left">Attempts</th>
                        <th class="px-3 py-2 text-left">Created At</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                    @forelse($jobs as $job)
                        <tr class="hover:bg-green-50">
                            <td class="px-3 py-2">{{ $job->id }}</td>
                            <td class="px-3 py-2">{{ $job->queue }}</td>
                            <td class="px-3 py-2">
                                <pre class="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{{ Str::limit($job->payload, 200) }}</pre>
                            </td>
                            <td class="px-3 py-2">{{ $job->attempts }}</td>
                            <td class="px-3 py-2">{{ $job->created_at ?? '' }}</td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-3 py-4 text-center text-gray-500">🙌 Không có job nào trong queue</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>

            {{-- Pagination --}}
            <div class="mt-4">
                {{ $jobs->links() }}
            </div>
        </div>
    </div>
</div>

{{-- Script check all --}}
<script>
    document.getElementById('check-all').addEventListener('click', function(){
        let checkboxes = document.querySelectorAll('input[name="ids[]"]');
        for(let checkbox of checkboxes){
            checkbox.checked = this.checked;
        }
    });
</script>
</body>
</html>
