var e={id:`filters`,h:{en:`Asking precise questions: filters, fields and paging`,hi:`Precise sawal poochna: filters, fields aur paging`},body:{en:`
<p>When you ask a librarian for "books about routers" you get a trolley. When you ask for "books about routers, published after 2020, in English, on the second floor" you get a short list. A filter is that second sentence. The skill of NetBox automation is asking a question that returns exactly the objects you mean, no more and no fewer, and then <i>checking</i> that it did.</p>

<h3>The filter language</h3>
<p>Any field of an object is a filter: <code>?site=pune</code>. Related objects are filtered by slug (<code>site=pune</code>) or by number (<code>site_id=1</code>). Repeat a key to mean "or": <code>?role=core-router&amp;role=access-switch</code>. Add a <b>lookup</b> after two underscores to change the meaning:</p>
<table class="cmp"><tr><th>Suffix</th><th>Meaning</th><th>Example</th></tr>
<tr><td>(none)</td><td>equals, case sensitive</td><td><code>name=PUN-CORE-R1</code></td></tr>
<tr><td><code>__n</code></td><td>not equal</td><td><code>status__n=active</code></td></tr>
<tr><td><code>__ic</code>, <code>__ie</code></td><td>contains, equals - ignoring case</td><td><code>name__ic=core</code></td></tr>
<tr><td><code>__isw</code>, <code>__iew</code></td><td>starts / ends with</td><td><code>name__isw=pun-</code></td></tr>
<tr><td><code>__in</code></td><td>one of a list</td><td><code>id__in=1,2</code></td></tr>
<tr><td><code>__gt</code>, <code>__lte</code> ...</td><td>number comparisons</td><td><code>vid__gt=50</code></td></tr>
<tr><td><code>__empty</code>, <code>__regex</code></td><td>empty test, regular expression</td><td><code>description__empty=true</code></td></tr></table>
<p>Besides fields there are shortcut filters: <code>tag=automation</code>, <code>cf_monitored=true</code> (custom field), <code>q=sw1</code> (free text search), <code>has_primary_ip=true</code>. IPAM adds the tree filters: for addresses <code>parent</code> and <code>mask_length</code>, for prefixes <code>within</code>, <code>within_include</code>, <code>contains</code> and <code>mask_length</code>.</p>

<h3>One script, twenty questions</h3>
<p><code>filters.py</code> asks a list of questions and prints how many objects each one matched. Read the answers as carefully as the questions.</p>
<pre class="code">"""filters.py - how many objects does each filter return?"""
from nbconn import URL, session

s = session()


def count(path, **params):
    r = s.get(URL + "/api/" + path + "/", params=params)
    body = r.json()
    shown = ", ".join("%s=%s" % kv for kv in params.items())
    if r.status_code != 200:
        print("%-44s -&gt; %s %s" % (path + " " + shown, r.status_code, body))
    else:
        print("%-44s -&gt; %d" % (path + " " + shown, body["count"]))


count("dcim/devices")
count("dcim/devices", site="pune")
count("dcim/devices", role="core-router")
count("dcim/devices", site="pune", role="core-router")
count("dcim/devices", name="pun-core-r1")
count("dcim/devices", name__ie="pun-core-r1")</pre>
<pre class="out">AUTO01$ python3 filters.py
dcim/devices                                 -&gt; 6
dcim/devices site=pune                       -&gt; 4
dcim/devices role=core-router                -&gt; 2
dcim/devices site=pune, role=core-router     -&gt; 2
<span class="hl">dcim/devices name=pun-core-r1                -&gt; 0</span>
dcim/devices name__ie=pun-core-r1            -&gt; 1
dcim/devices name__ic=CORE                   -&gt; 2
dcim/devices status__n=active                -&gt; 1
dcim/devices tag=automation                  -&gt; 2
dcim/devices cf_monitored=true               -&gt; 4
dcim/devices has_primary_ip=true             -&gt; 6
dcim/devices q=sw1                           -&gt; 3
dcim/devices sitee=pune                      -&gt; 6
dcim/devices site=nowhere                    -&gt; 400 {'site': ['Select a valid choice. nowhere is not one of the available choices.']}
dcim/devices status=zzz                      -&gt; 400 {'status': ['Select a valid choice. zzz is not one of the available choices.']}
ipam/ip-addresses parent=10.99.0.0/24        -&gt; 5
ipam/ip-addresses mask_length=32             -&gt; 3
ipam/prefixes within_include=10.0.0.0/8      -&gt; 5
ipam/prefixes within=10.0.0.0/8              -&gt; 4
ipam/prefixes mask_length=24, family=4       -&gt; 8
repeated role key -&gt; 4</pre>

<h3>Three lines to stare at</h3>
<ul>
<li><b><code>name=pun-core-r1</code> gives 0, <code>name__ie=pun-core-r1</code> gives 1.</b> Exact match is case sensitive. An empty answer is not an error, so a script that depends on it must handle "nothing found".</li>
<li><b><code>sitee=pune</code> gives 6, the whole estate.</b> The lab ignores a filter name it does not know, so a typo does not narrow the answer, it removes the filter. This is the dangerous one: a push script with this typo would have targeted every device.</li>
<li><b><code>site=nowhere</code> gives 400.</b> A known filter with a value that cannot exist is rejected loudly, which is the safer behaviour.</li></ul>

<h3>Shaping and paging the answer</h3>
<p><code>fields=id,name</code> returns only those fields, which makes big queries small and fast. <code>ordering=-name</code> sorts, with a minus for descending. <code>limit</code> and <code>offset</code> page the answer: the default page is 50, <code>limit=0</code> asks for the maximum, and the envelope's <code>next</code> URL points to the following page.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/?site=pune&amp;role=core-router&amp;fields=id,name,status,serial"
{"count":2,"next":null,"previous":null,"results":[{"id":1,"name":"PUN-CORE-R1","serial":"NKCSR0001","status":{"value":"active","label":"Active"}},{"id":2,"name":"PUN-CORE-R3","serial":"NKCSR0003","status":{"value":"active","label":"Active"}}]}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/?limit=2&amp;offset=2&amp;ordering=-name&amp;fields=id,name"
{"count":6,"next":"h&#116;tps://10.99.0.80/api/dcim/devices/?limit=2&amp;offset=4&amp;ordering=-name&amp;fields=id%2Cname","previous":"h&#116;tps://10.99.0.80/api/dcim/devices/?limit=2&amp;ordering=-name&amp;fields=id%2Cname","results":[{"id":1,"name":"PUN-CORE-R1"},{"id":4,"name":"PUN-ACC-SW1"}]}</pre>
<p>Here <code>count</code> is 6 even though only two results are shown: it always reports the total that match, not the size of this page. Python code that reads only <code>results</code> silently loses everything past the first page. Chapter 5 shows how pynetbox follows <code>next</code> for you.</p>

<div class="warn"><p><b>Habit: count before you act.</b> Before a script changes anything, check the number of objects you selected against what you expect, and stop if it differs. <code>assert len(devices) == 2</code> is the cheapest safety net in automation. A compare against the unfiltered total catches the ignored-filter typo at once.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reading <code>len(results)</code> instead of <code>count</code>. They are equal only when everything fits on one page.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts a subset of the real filters under the same names, and it ignores unknown filter names, as NetBox's filter sets do by default. A real server can be configured or versioned to behave differently, so test an unfamiliar filter against a known count before you rely on it.</p></div>

<div class="scn"><h4>The filter that matched everything</h4><p>A change script selected "the Pune access switches" with <code>role=access-swtch</code>. The server answered 400 with "Select a valid choice", the script crashed, and nothing changed. The next week the same typo was in the field name, <code>rol=access-switch</code>, which was ignored, and the script walked every device. A count check ("expected 1, found 6") stopped it before the first push.</p><p><b>Lesson:</b> a loud error is a gift; a quiet wrong answer needs a guard you wrote yourself.</p></div>
<div class="iv"><p class="q">"How do you make sure a NetBox query selects the right devices?"</p><p>I filter by slugs or ids, compare <code>count</code> with what I expect, assert before any change, and log the names selected. I also remember that exact matches are case sensitive and that a mistyped filter name may be ignored rather than rejected.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters are field names; lookups such as <code>__n</code>, <code>__ic</code>, <code>__in</code> change the meaning.</li>
<li>Exact match is case sensitive; use <code>__ie</code> to ignore case.</li>
<li>An unknown filter name may be ignored and return everything; a bad value gives 400.</li>
<li><code>fields</code>, <code>ordering</code>, <code>limit</code> and <code>offset</code> shape and page the answer; <code>count</code> is the total.</li>
<li>Assert the count before you change anything.</li></ul></div>`,hi:`
<p>Librarian se "routers ki kitabein" maango to ek trolley milti hai. "Routers ki kitabein, 2020 ke baad chhapi, English mein, doosri manzil par" maango to chhoti list milti hai. Filter woh doosra vaakya hai. NetBox automation ka hunar hai aisa sawal poochna jo theek wahi objects lautaye jo aap chahte ho, na zyada na kam, aur phir <i>check</i> karna ki aisa hua.</p>

<h3>Filter ki bhasha</h3>
<p>Object ka koi bhi field filter hai: <code>?site=pune</code>. Related objects slug (<code>site=pune</code>) ya number (<code>site_id=1</code>) se filter hote hain. "Ya" ke liye key repeat karo: <code>?role=core-router&amp;role=access-switch</code>. Matlab badalne ke liye do underscores ke baad ek <b>lookup</b> lagao:</p>
<table class="cmp"><tr><th>Suffix</th><th>Matlab</th><th>Example</th></tr>
<tr><td>(koi nahi)</td><td>barabar, case sensitive</td><td><code>name=PUN-CORE-R1</code></td></tr>
<tr><td><code>__n</code></td><td>barabar nahi</td><td><code>status__n=active</code></td></tr>
<tr><td><code>__ic</code>, <code>__ie</code></td><td>contains, equals - case ignore karke</td><td><code>name__ic=core</code></td></tr>
<tr><td><code>__isw</code>, <code>__iew</code></td><td>se shuru / par khatam</td><td><code>name__isw=pun-</code></td></tr>
<tr><td><code>__in</code></td><td>list mein se ek</td><td><code>id__in=1,2</code></td></tr>
<tr><td><code>__gt</code>, <code>__lte</code> ...</td><td>number comparisons</td><td><code>vid__gt=50</code></td></tr>
<tr><td><code>__empty</code>, <code>__regex</code></td><td>khali test, regular expression</td><td><code>description__empty=true</code></td></tr></table>
<p>Fields ke alawa shortcut filters bhi hain: <code>tag=automation</code>, <code>cf_monitored=true</code> (custom field), <code>q=sw1</code> (free text search), <code>has_primary_ip=true</code>. IPAM tree filters jodta hai: addresses ke liye <code>parent</code> aur <code>mask_length</code>, prefixes ke liye <code>within</code>, <code>within_include</code>, <code>contains</code> aur <code>mask_length</code>.</p>

<h3>Ek script, bees sawal</h3>
<p><code>filters.py</code> sawalon ki list poochti hai aur print karti hai ki har ek ne kitne objects match kiye. Jawab utni hi dhyan se padho jitni dhyan se sawal.</p>
<pre class="code">"""filters.py - how many objects does each filter return?"""
from nbconn import URL, session

s = session()


def count(path, **params):
    r = s.get(URL + "/api/" + path + "/", params=params)
    body = r.json()
    shown = ", ".join("%s=%s" % kv for kv in params.items())
    if r.status_code != 200:
        print("%-44s -&gt; %s %s" % (path + " " + shown, r.status_code, body))
    else:
        print("%-44s -&gt; %d" % (path + " " + shown, body["count"]))


count("dcim/devices")
count("dcim/devices", site="pune")
count("dcim/devices", role="core-router")
count("dcim/devices", site="pune", role="core-router")
count("dcim/devices", name="pun-core-r1")
count("dcim/devices", name__ie="pun-core-r1")</pre>
<pre class="out">AUTO01$ python3 filters.py
dcim/devices                                 -&gt; 6
dcim/devices site=pune                       -&gt; 4
dcim/devices role=core-router                -&gt; 2
dcim/devices site=pune, role=core-router     -&gt; 2
<span class="hl">dcim/devices name=pun-core-r1                -&gt; 0</span>
dcim/devices name__ie=pun-core-r1            -&gt; 1
dcim/devices name__ic=CORE                   -&gt; 2
dcim/devices status__n=active                -&gt; 1
dcim/devices tag=automation                  -&gt; 2
dcim/devices cf_monitored=true               -&gt; 4
dcim/devices has_primary_ip=true             -&gt; 6
dcim/devices q=sw1                           -&gt; 3
dcim/devices sitee=pune                      -&gt; 6
dcim/devices site=nowhere                    -&gt; 400 {'site': ['Select a valid choice. nowhere is not one of the available choices.']}
dcim/devices status=zzz                      -&gt; 400 {'status': ['Select a valid choice. zzz is not one of the available choices.']}
ipam/ip-addresses parent=10.99.0.0/24        -&gt; 5
ipam/ip-addresses mask_length=32             -&gt; 3
ipam/prefixes within_include=10.0.0.0/8      -&gt; 5
ipam/prefixes within=10.0.0.0/8              -&gt; 4
ipam/prefixes mask_length=24, family=4       -&gt; 8
repeated role key -&gt; 4</pre>

<h3>Teen lines jinhe ghurna hai</h3>
<ul>
<li><b><code>name=pun-core-r1</code> 0 deta hai, <code>name__ie=pun-core-r1</code> 1 deta hai.</b> Exact match case sensitive hai. Khali jawab error nahi hai, isliye jis script ko us par nirbhar rehna hai use "kuch nahi mila" sambhalna hoga.</li>
<li><b><code>sitee=pune</code> 6 deta hai, poora estate.</b> Lab aise filter ka naam ignore karta hai jo use nahi pata, isliye typo answer ko chhota nahi karta, filter hata deta hai. Yeh khatarnak wala hai: is typo wali push script har device ko target kar deti.</li>
<li><b><code>site=nowhere</code> 400 deta hai.</b> Jaana-pehchana filter jiski value exist hi nahi kar sakti, zor se reject hota hai, jo zyada safe behaviour hai.</li></ul>

<h3>Answer ko shakal dena aur page karna</h3>
<p><code>fields=id,name</code> sirf wahi fields lautata hai, jisse bade queries chhoti aur tez ho jati hain. <code>ordering=-name</code> sort karta hai, minus descending ke liye. <code>limit</code> aur <code>offset</code> answer ko page karte hain: default page 50 ka hai, <code>limit=0</code> maximum maangta hai, aur envelope ka <code>next</code> URL agle page ko point karta hai.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/?site=pune&amp;role=core-router&amp;fields=id,name,status,serial"
{"count":2,"next":null,"previous":null,"results":[{"id":1,"name":"PUN-CORE-R1","serial":"NKCSR0001","status":{"value":"active","label":"Active"}},{"id":2,"name":"PUN-CORE-R3","serial":"NKCSR0003","status":{"value":"active","label":"Active"}}]}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/dcim/devices/?limit=2&amp;offset=2&amp;ordering=-name&amp;fields=id,name"
{"count":6,"next":"h&#116;tps://10.99.0.80/api/dcim/devices/?limit=2&amp;offset=4&amp;ordering=-name&amp;fields=id%2Cname","previous":"h&#116;tps://10.99.0.80/api/dcim/devices/?limit=2&amp;ordering=-name&amp;fields=id%2Cname","results":[{"id":1,"name":"PUN-CORE-R1"},{"id":4,"name":"PUN-ACC-SW1"}]}</pre>
<p>Yahan <code>count</code> 6 hai jabki sirf do results dikhe: woh hamesha match hone wale kul ginti batata hai, is page ka size nahi. Jo Python code sirf <code>results</code> padhta hai woh pehle page ke baad ka sab chupchap kho deta hai. Chapter 5 dikhata hai ki pynetbox <code>next</code> ko aapke liye kaise follow karta hai.</p>

<div class="warn"><p><b>Aadat: karne se pehle gino.</b> Script kuch badalne se pehle, jitne objects select hue unki ginti apni ummeed se milao, aur farq ho to ruk jao. <code>assert len(devices) == 2</code> automation ka sabse sasta safety net hai. Unfiltered total se compare karne par ignored-filter typo turant pakda jata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>count</code> ki jagah <code>len(results)</code> padhna. Yeh tabhi barabar hote hain jab sab kuch ek page mein aa jaye.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab asli filters ka ek subset unhi naamon se leta hai, aur unknown filter names ignore karta hai, jaisa NetBox ke filter sets default mein karte hain. Asli server configuration ya version ke hisaab se alag behave kar sakta hai, isliye anjaan filter par bharosa karne se pehle use kisi jaani hui ginti se test karo.</p></div>

<div class="scn"><h4>Filter jo sab match kar gaya</h4><p>Ek change script ne "Pune ke access switches" ko <code>role=access-swtch</code> se select kiya. Server ne 400 "Select a valid choice" diya, script crash hui, kuch nahi badla. Agle hafte wahi typo field ke naam mein tha, <code>rol=access-switch</code>, jo ignore hua, aur script har device par chal padi. Count check ("expected 1, found 6") ne use pehle push se pehle rok diya.</p><p><b>Lesson:</b> zor ka error ek tohfa hai; chupchap galat jawab ke liye aapko apna guard likhna padta hai.</p></div>
<div class="iv"><p class="q">"Kaise pakka karte ho ki NetBox query sahi devices select kare?"</p><p>Main slugs ya ids se filter karta hoon, <code>count</code> ko apni ummeed se milata hoon, kisi bhi change se pehle assert karta hoon, aur select hue naam log karta hoon. Yaad rakhta hoon ki exact match case sensitive hai aur galat likha filter name reject hone ki jagah ignore ho sakta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Filters field names hain; <code>__n</code>, <code>__ic</code>, <code>__in</code> jaise lookups matlab badalte hain.</li>
<li>Exact match case sensitive hai; case ignore karne ke liye <code>__ie</code> use karo.</li>
<li>Unknown filter name ignore ho sakta hai aur sab lauta sakta hai; galat value 400 deti hai.</li>
<li><code>fields</code>, <code>ordering</code>, <code>limit</code> aur <code>offset</code> answer ko shakal aur page dete hain; <code>count</code> kul hai.</li>
<li>Kuch badalne se pehle count assert karo.</li></ul></div>`}};export{e as default};