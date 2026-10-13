var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 230" role="img" aria-label="What a Response holds">
<rect x="10" y="10" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="105" y="34" text-anchor="middle" class="svg-ink" font-size="13">conn.send_command(</text><text x="105" y="54" text-anchor="middle" class="svg-ink" font-size="12">"show clock")</text>
<rect x="260" y="10" width="370" height="210" rx="10" fill="#e2e8f0"/><text x="445" y="32" text-anchor="middle" class="svg-ink" font-size="14">Response</text>
<rect x="276" y="44" width="170" height="30" rx="6" fill="#bae6fd"/><text x="361" y="64" text-anchor="middle" class="svg-ink" font-size="12">host, channel_input</text>
<rect x="454" y="44" width="160" height="30" rx="6" fill="#bae6fd"/><text x="534" y="64" text-anchor="middle" class="svg-ink" font-size="12">start / finish / elapsed</text>
<rect x="276" y="84" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="361" y="104" text-anchor="middle" class="svg-ink" font-size="12">result (text)</text>
<rect x="454" y="84" width="160" height="30" rx="6" fill="#bbf7d0"/><text x="534" y="104" text-anchor="middle" class="svg-ink" font-size="12">raw_result</text>
<rect x="276" y="124" width="338" height="30" rx="6" fill="#fed7aa"/><text x="445" y="144" text-anchor="middle" class="svg-ink" font-size="12">failed  (True = an error string matched)</text>
<rect x="276" y="164" width="170" height="44" rx="6" fill="#fde68a"/><text x="361" y="182" text-anchor="middle" class="svg-ink" font-size="12">textfsm_parse_output()</text><text x="361" y="198" text-anchor="middle" class="svg-muted" font-size="11">list of dicts</text>
<rect x="454" y="164" width="160" height="44" rx="6" fill="#fde68a"/><text x="534" y="182" text-anchor="middle" class="svg-ink" font-size="12">raise_for_status()</text><text x="534" y="198" text-anchor="middle" class="svg-muted" font-size="11">ScrapliCommandFailure</text>
<line x1="200" y1="40" x2="260" y2="40" stroke="#64748b" stroke-width="2"/>
</svg>`,n={id:`responses`,h:{en:`Response and MultiResponse: every command leaves a receipt`,hi:`Response aur MultiResponse: har command ek receipt chhodti hai`},body:{en:`
<p><b>The idea of this chapter:</b> in netmiko a command gives you text. In scrapli it gives you an object that contains the text and the facts about the delivery. Learn the object once and every later chapter is easy.</p>

<h3>What is inside a Response</h3>
`+e(t,`One Response per command. The failed flag is the part netmiko does not have.`)+`
<table class="cmp"><tr><th>Attribute or method</th><th>What it gives you</th></tr>
<tr><td><code>host</code>, <code>channel_input</code></td><td>the device and the exact text that was sent</td></tr>
<tr><td><code>result</code></td><td>the output as text, with the command echo and the prompt removed</td></tr>
<tr><td><code>raw_result</code></td><td>the output as received (bytes on real gear)</td></tr>
<tr><td><code>failed</code></td><td><code>True</code> when the output contained one of the error strings in <code>failed_when_contains</code></td></tr>
<tr><td><code>elapsed_time</code>, <code>start_time</code>, <code>finish_time</code></td><td>timing of this one command</td></tr>
<tr><td><code>textfsm_parse_output()</code></td><td>a list of dictionaries (chapter 4)</td></tr>
<tr><td><code>raise_for_status()</code></td><td>raises <code>ScrapliCommandFailure</code> when <code>failed</code> is true</td></tr></table>

<h3>Lab 1, task 3: responses.py</h3>
<p>The script sends a good command and a mistyped one to R1 and prints what comes back.</p>
<pre class="code">from scrapli.exceptions import ScrapliCommandFailure
from common import load_inventory, connect

r1 = [row for row in load_inventory() if row["name"] == "R1"][0]
with connect(r1) as conn:
    good = conn.send_command("show ip interface brief")
    print(good, good.failed, good.channel_input)
    print(f"interfaces parsed: {len(good.textfsm_parse_output())}")
    bad = conn.send_command("show ip interfaces brief")
    print(bad, bad.failed)
    print(bad.result)
    many = conn.send_commands(["show clock", "show ip interfaces brief", "show version"])
    print(many, len(many), [r.failed for r in many])
    try:
        bad.raise_for_status()
    except ScrapliCommandFailure:
        print("raise_for_status() raised ScrapliCommandFailure")</pre>
<pre class="out">AUTO01$ python3 responses.py
Response &lt;Success: True&gt; False show ip interface brief
<span class="hl">interfaces parsed: 5</span>
Response &lt;Success: False&gt; True
                    ^
% Invalid input detected at '^' marker.
MultiResponse &lt;Success: False; Response Elements: 3&gt; 3 [False, True, False]
raise_for_status() raised ScrapliCommandFailure</pre>
<p>Read it line by line. <code>print(good)</code> shows <code>Response &lt;Success: True&gt;</code>, the object's own summary. The next item on that line is <code>good.failed</code>, which is <code>False</code>. The mistyped command prints <code>Success: False</code> and <code>failed</code> is <code>True</code>; its <code>result</code> is the router's complaint, with the caret that points at the error. <code>send_commands</code> returned a <code>MultiResponse</code> with three elements, of which the middle one failed. Finally <code>raise_for_status()</code> turned the flag into an exception you can catch.</p>

<h3>A trap: the truth value of a Response</h3>
<p>In scrapli <code>bool(response)</code> equals <code>response.failed</code>. So <code>if response:</code> means "if it <b>failed</b>", the opposite of what most people expect. Write <code>if response.failed:</code> or <code>if not response.failed:</code> and the code reads correctly.</p>
<pre class="code">from scrapli import Scrapli

dev = {
    "platform": "cisco_iosxe",
    "host": "10.99.0.1",
    "auth_username": "netops",
    "auth_password": "NK@2026",
    "auth_secondary": "NK@2026",
    "auth_strict_key": False,
}
with Scrapli(**dev) as conn:
    r = conn.send_command("show ip interface brief")
    print(r.host, "|", r.channel_input, "|", r.failed, "|", type(r.elapsed_time).__name__)
    print(r.result.splitlines()[0])
    bad = conn.send_command("show ip interfaces brief")
    print(bool(r), bool(bad))

    multi = conn.send_commands(["show clock", "show bogus", "show version"], stop_on_failed=True)
    print(multi, len(multi))
    for item in multi:
        print(item.channel_input, item.failed)

    odd = conn.send_command("show interface Gi9/9")
    print(odd, repr(odd.result))
    odd = conn.send_command("show interface Gi9/9", failed_when_contains=["% "])
    print(odd)</pre>
<pre class="out">AUTO01$ python3 ch3.py
10.99.0.1 | show ip interface brief | False | float
Interface              IP-Address      OK? Method Status                Protocol
False True
MultiResponse &lt;Success: False; Response Elements: 2&gt; 2
show clock False
show bogus True
Response &lt;Success: True&gt; '% Invalid interface'
Response &lt;Success: False&gt;</pre>
<p>Notice <code>bool(r), bool(bad)</code> printing <code>False True</code>, and how <code>stop_on_failed=True</code> stopped the list after <code>show bogus</code>: the third command was never sent, so the MultiResponse has 2 elements. Without <code>stop_on_failed</code> all three are sent.</p>

<h3>Where failed comes from, and its blind spots</h3>
<p>scrapli does not understand the output. It checks whether any string in <code>failed_when_contains</code> appears in it. The lists are per platform:</p>
<table class="cmp"><tr><th>Platform</th><th>Default error strings</th></tr>
<tr><td><code>cisco_iosxe</code></td><td><code>% Ambiguous command</code>, <code>% Incomplete command</code>, <code>% Invalid input detected</code>, <code>% Unknown command</code></td></tr>
<tr><td><code>arista_eos</code></td><td><code>% Ambiguous command</code>, <code>% Incomplete command</code>, <code>% Invalid input</code>, <code>% Cannot commit</code>, <code>% Unavailable command</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>is ambiguous</code>, <code>No valid completions</code>, <code>unknown command</code>, <code>syntax error</code></td></tr></table>
<p>Anything else is a success as far as scrapli knows. In the last lines of the output above, <code>show interface Gi9/9</code> answered <code>% Invalid interface</code>, which is not in the list, so <code>failed</code> stayed <code>False</code>. Passing <code>failed_when_contains=["% "]</code> for that call made it <code>Success: False</code>. You can pass the argument per call, or once when you create the connection. The same blind spot hides an address overlap in Lab 2.</p>

<div class="warn"><p><b>Common mistakes.</b> Writing <code>if response:</code> and meaning success. Saving <code>response.result</code> without looking at <code>failed</code>. Believing that <code>failed=False</code> proves the change worked: it only proves that none of the listed strings appeared. Setting <code>failed_when_contains</code> so broad that a harmless banner containing the string fails every command.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>MultiResponse.failed</code> is true if <b>any</b> element failed; to find which, loop over the elements and check each one. <code>MultiResponse.result</code> joins the commands and outputs into one text.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> In the lab <code>raw_result</code> is also text; the real library returns bytes. <code>elapsed_time</code> is measured on the lab clock. <code>raise_for_status()</code> raises <code>ScrapliCommandFailure</code> with an empty message in the lab.</p></div>

<div class="scn"><h4>The loopback that never got an address</h4><p>A change script configured a loopback and reported "Success: True" for thirty routers. Two of them had no address on the loopback: the address overlapped an existing interface, and IOS answered <code>% 10.99.0.0 overlaps with GigabitEthernet0/0</code>. That text is not one of the default error strings. The team added <code>failed_when_contains=["% "]</code> to every configuration call and a read-back check after it.</p><p><b>Lesson:</b> a flag is only as good as its list; always verify state after a change.</p></div>

<div class="iv"><p class="q">"What does response.failed tell you, and what does it not?"</p><p>It tells you that the output contained one of the configured error strings, nothing more. It does not know about errors worded differently, so for configuration I extend <code>failed_when_contains</code> and read the state back afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_command</code> returns a <code>Response</code>; <code>send_commands</code> returns a <code>MultiResponse</code>.</li>
<li><code>result</code> is the text, <code>failed</code> the verdict, <code>elapsed_time</code> the timing.</li>
<li><code>bool(response)</code> is <code>response.failed</code>: never write a bare <code>if response:</code>.</li>
<li><code>failed</code> comes from string matching against <code>failed_when_contains</code>; extend it when your platform words errors differently.</li>
<li><code>raise_for_status()</code> and <code>stop_on_failed=True</code> turn the flag into control flow.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> netmiko mein command aapko text deti hai. scrapli mein woh ek object deti hai jisme text aur delivery ke facts dono hain. Object ek baar seekh lo to baaki chapters aasan hain.</p>

<h3>Response ke andar kya hai</h3>
`+e(t,`Har command ke liye ek Response. failed flag woh hissa hai jo netmiko mein nahi hai.`)+`
<table class="cmp"><tr><th>Attribute ya method</th><th>Kya deta hai</th></tr>
<tr><td><code>host</code>, <code>channel_input</code></td><td>device aur woh exact text jo bheja gaya</td></tr>
<tr><td><code>result</code></td><td>output text ke roop mein, command echo aur prompt hata kar</td></tr>
<tr><td><code>raw_result</code></td><td>output jaisa mila waisa (real gear par bytes)</td></tr>
<tr><td><code>failed</code></td><td>output mein <code>failed_when_contains</code> ki koi error string thi to <code>True</code></td></tr>
<tr><td><code>elapsed_time</code>, <code>start_time</code>, <code>finish_time</code></td><td>is ek command ki timing</td></tr>
<tr><td><code>textfsm_parse_output()</code></td><td>dictionaries ki list (chapter 4)</td></tr>
<tr><td><code>raise_for_status()</code></td><td><code>failed</code> true ho to <code>ScrapliCommandFailure</code> raise karta hai</td></tr></table>

<h3>Lab 1, task 3: responses.py</h3>
<p>Script R1 ko ek theek aur ek galat likhi command bhejti hai aur jo wapas aata hai woh print karti hai.</p>
<pre class="code">from scrapli.exceptions import ScrapliCommandFailure
from common import load_inventory, connect

r1 = [row for row in load_inventory() if row["name"] == "R1"][0]
with connect(r1) as conn:
    good = conn.send_command("show ip interface brief")
    print(good, good.failed, good.channel_input)
    print(f"interfaces parsed: {len(good.textfsm_parse_output())}")
    bad = conn.send_command("show ip interfaces brief")
    print(bad, bad.failed)
    print(bad.result)
    many = conn.send_commands(["show clock", "show ip interfaces brief", "show version"])
    print(many, len(many), [r.failed for r in many])
    try:
        bad.raise_for_status()
    except ScrapliCommandFailure:
        print("raise_for_status() raised ScrapliCommandFailure")</pre>
<pre class="out">AUTO01$ python3 responses.py
Response &lt;Success: True&gt; False show ip interface brief
<span class="hl">interfaces parsed: 5</span>
Response &lt;Success: False&gt; True
                    ^
% Invalid input detected at '^' marker.
MultiResponse &lt;Success: False; Response Elements: 3&gt; 3 [False, True, False]
raise_for_status() raised ScrapliCommandFailure</pre>
<p>Ise line-by-line padho. <code>print(good)</code> <code>Response &lt;Success: True&gt;</code> dikhata hai, object ka apna summary. Us line par agla item <code>good.failed</code> hai, jo <code>False</code> hai. Galat command <code>Success: False</code> print karti hai aur <code>failed</code> <code>True</code> hai; uska <code>result</code> router ki shikayat hai, caret ke saath jo galti par ishara karta hai. <code>send_commands</code> ne teen elements ka <code>MultiResponse</code> diya, jisme beech wala fail hua. Aakhir mein <code>raise_for_status()</code> ne flag ko exception bana diya jo aap pakad sakte ho.</p>

<h3>Ek trap: Response ki truth value</h3>
<p>scrapli mein <code>bool(response)</code> barabar hai <code>response.failed</code> ke. Yaani <code>if response:</code> ka matlab hai "agar yeh <b>fail</b> hui", jo zyadatar logon ki ummeed ka ulta hai. <code>if response.failed:</code> ya <code>if not response.failed:</code> likho to code sahi padhta hai.</p>
<pre class="code">from scrapli import Scrapli

dev = {
    "platform": "cisco_iosxe",
    "host": "10.99.0.1",
    "auth_username": "netops",
    "auth_password": "NK@2026",
    "auth_secondary": "NK@2026",
    "auth_strict_key": False,
}
with Scrapli(**dev) as conn:
    r = conn.send_command("show ip interface brief")
    print(r.host, "|", r.channel_input, "|", r.failed, "|", type(r.elapsed_time).__name__)
    print(r.result.splitlines()[0])
    bad = conn.send_command("show ip interfaces brief")
    print(bool(r), bool(bad))

    multi = conn.send_commands(["show clock", "show bogus", "show version"], stop_on_failed=True)
    print(multi, len(multi))
    for item in multi:
        print(item.channel_input, item.failed)

    odd = conn.send_command("show interface Gi9/9")
    print(odd, repr(odd.result))
    odd = conn.send_command("show interface Gi9/9", failed_when_contains=["% "])
    print(odd)</pre>
<pre class="out">AUTO01$ python3 ch3.py
10.99.0.1 | show ip interface brief | False | float
Interface              IP-Address      OK? Method Status                Protocol
False True
MultiResponse &lt;Success: False; Response Elements: 2&gt; 2
show clock False
show bogus True
Response &lt;Success: True&gt; '% Invalid interface'
Response &lt;Success: False&gt;</pre>
<p><code>bool(r), bool(bad)</code> ka <code>False True</code> print karna dekho, aur kaise <code>stop_on_failed=True</code> ne <code>show bogus</code> ke baad list rok di: teesri command kabhi bheji hi nahi gayi, isliye MultiResponse mein 2 elements hain. <code>stop_on_failed</code> ke bina teeno bheji jaati hain.</p>

<h3>failed kahan se aata hai, aur uske blind spots</h3>
<p>scrapli output ko samajhta nahi. Woh bas check karta hai ki <code>failed_when_contains</code> ki koi string usme hai ya nahi. Lists platform ke hisaab se hain:</p>
<table class="cmp"><tr><th>Platform</th><th>Default error strings</th></tr>
<tr><td><code>cisco_iosxe</code></td><td><code>% Ambiguous command</code>, <code>% Incomplete command</code>, <code>% Invalid input detected</code>, <code>% Unknown command</code></td></tr>
<tr><td><code>arista_eos</code></td><td><code>% Ambiguous command</code>, <code>% Incomplete command</code>, <code>% Invalid input</code>, <code>% Cannot commit</code>, <code>% Unavailable command</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>is ambiguous</code>, <code>No valid completions</code>, <code>unknown command</code>, <code>syntax error</code></td></tr></table>
<p>Baaki sab scrapli ki nazar mein success hai. Upar output ki aakhri lines mein <code>show interface Gi9/9</code> ne <code>% Invalid interface</code> jawab diya, jo list mein nahi hai, isliye <code>failed</code> <code>False</code> hi raha. Us call ke liye <code>failed_when_contains=["% "]</code> dene se woh <code>Success: False</code> ho gayi. Argument aap har call par de sakte ho, ya connection banate waqt ek baar. Yahi blind spot Lab 2 mein address overlap ko chhupata hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> <code>if response:</code> likhna aur success ka matlab lena. <code>failed</code> dekhe bina <code>response.result</code> save karna. Maan lena ki <code>failed=False</code> sabit karta hai ki change kaam kar gaya: yeh sirf itna sabit karta hai ki listed strings nahi aayin. <code>failed_when_contains</code> itna broad rakhna ki ek harmless banner jisme woh string ho har command fail kar de.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>MultiResponse.failed</code> tab true hota hai jab <b>koi bhi</b> element fail ho; kaun sa, yeh janne ke liye elements par loop karke har ek check karo. <code>MultiResponse.result</code> commands aur outputs ko ek text mein jodta hai.</p></div>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab mein <code>raw_result</code> bhi text hai; asli library bytes deti hai. <code>elapsed_time</code> lab clock par naapa jaata hai. <code>raise_for_status()</code> lab mein khaali message ke saath <code>ScrapliCommandFailure</code> raise karta hai.</p></div>

<div class="scn"><h4>Woh loopback jise address kabhi nahi mila</h4><p>Ek change script ne loopback configure kiya aur tees routers ke liye "Success: True" report kiya. Do routers par loopback par address tha hi nahi: address kisi maujooda interface se overlap kar gaya, aur IOS ne <code>% 10.99.0.0 overlaps with GigabitEthernet0/0</code> jawab diya. Yeh text default error strings mein nahi hai. Team ne har configuration call mein <code>failed_when_contains=["% "]</code> aur uske baad read-back check jod diya.</p><p><b>Lesson:</b> flag utna hi accha hai jitni uski list; change ke baad hamesha state verify karo.</p></div>

<div class="iv"><p class="q">"response.failed aapko kya batata hai, aur kya nahi?"</p><p>Yeh batata hai ki output mein configured error strings mein se koi thi, bas. Yeh alag shabdon wale errors ke baare mein nahi jaanta, isliye configuration ke liye main <code>failed_when_contains</code> badhata hoon aur baad mein state wapas padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>send_command</code> <code>Response</code> lautata hai; <code>send_commands</code> <code>MultiResponse</code>.</li>
<li><code>result</code> text hai, <code>failed</code> faisla, <code>elapsed_time</code> timing.</li>
<li><code>bool(response)</code> barabar hai <code>response.failed</code>: kabhi akela <code>if response:</code> mat likho.</li>
<li><code>failed</code> <code>failed_when_contains</code> se string matching se aata hai; jab platform errors alag shabdon mein kahe to use badhao.</li>
<li><code>raise_for_status()</code> aur <code>stop_on_failed=True</code> flag ko control flow banate hain.</li>
</ul></div>
`}};export{n as default};