var e={id:`adhoc-commands`,h:{en:`Ad-hoc commands: your first conversations with the devices`,hi:`Ad-hoc commands: devices se aapki pehli baatcheet`},body:{en:`
<p>Before you write a playbook, it helps to say a single sentence to many devices and see their replies. That is what an <b>ad-hoc command</b> does: one module, one run, no file. Think of it as shouting one question across a room of routers: "Everyone, show me your interfaces", and each router answers. Ad-hoc commands are the quickest way to check connectivity, collect a fact, or make one tiny change.</p>

<h3>The shape of an ad-hoc command</h3>
<pre class="code">ansible  PATTERN  -m MODULE  -a "ARGUMENTS"
<span class="c">#        who      which worker  what to give it</span></pre>
<ul>
<li><b>PATTERN</b> chooses the hosts: <code>all</code>, a group such as <code>routers</code>, a single inventory name, or a combination such as <code>routers:!edge</code> (routers except the edge group). The next module explores patterns in depth.</li>
<li><b>-m</b> names the module, preferably by its full name.</li>
<li><b>-a</b> passes arguments to the module as <code>key=value</code> pairs inside quotes.</li>
</ul>

<h3>1. ping: can Ansible log in?</h3>
<p>You met this in the last chapter. For a network device the <code>ping</code> module does <b>not</b> send ICMP; it opens the SSH session and checks the CLI. The flag <code>-o</code> prints each result on one line, handy for many devices.</p>
<pre class="out">AUTO01$ ansible all -m ping -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "ping": "pong" }
blr-edge-r2 | SUCCESS =&gt; { "changed": false, "ping": "pong" }
pun-acc-sw1 | SUCCESS =&gt; { "changed": false, "ping": "pong" }</pre>

<h3>2. ios_command: run show commands</h3>
<p><code>cisco.ios.ios_command</code> runs exec-level commands such as <code>show</code> and returns the text. It never changes configuration. We ask only the <code>routers</code> group, so the switch stays silent.</p>
<pre class="out">AUTO01$ ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     unassigned      YES unset  administratively down down\\n..."
    ],
    <span class="hl">"stdout_lines": [</span>
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
            "GigabitEthernet0/1     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}
blr-edge-r2 | SUCCESS =&gt; { ... same shape, Gi0/0 is 10.99.0.2 ... }</pre>
<p>(Output shortened: the <code>stdout</code> text is cut and the second router is summarised.) Two fields hold the text. <code>stdout</code> is a <b>list with one string per command</b>; <code>stdout_lines</code> is the same text split into lines, a list of lists. You will use both when you write playbooks that react to output.</p>

<h3>3. ios_facts: collect facts</h3>
<p><b>Facts</b> are details about a device that Ansible gathers and names for you.</p>
<pre class="out">AUTO01$ ansible pun-core-r1 -m cisco.ios.ios_facts
pun-core-r1 | SUCCESS =&gt; {
    "ansible_facts": {
        "ansible_net_all_ipv4_addresses": [
            "10.99.0.1"
        ],
        "ansible_net_api": "cliconf",
        <span class="hl">"ansible_net_hostname": "PUN-CORE-R1",</span>
        ...
        "ansible_net_model": "ISR4331",
        ...
        "ansible_net_system": "ios",
        "ansible_net_version": "2.0"
    },
    "changed": false
}</pre>
<p>(Output shortened with dots.) Every fact starts with <code>ansible_net_</code>. Later chapters use them in conditions, for example "only run this on newer software".</p>

<h3>4. ios_config: make one small change</h3>
<p><code>cisco.ios.ios_config</code> sends configuration lines. Use <code>parents</code> for the interface or section the lines belong to. Here we label a spare port on the Pune router.</p>
<pre class="out">AUTO01$ ansible pun-core-r1 -m cisco.ios.ios_config -a "parents='interface GigabitEthernet0/3' lines='description SPARE-PORT'"
pun-core-r1 | <span class="hl">CHANGED</span> =&gt; {
    "banners": {},
    "changed": true,
    "commands": [
        "interface GigabitEthernet0/3",
        "description SPARE-PORT"
    ],
    "updates": [
        "interface GigabitEthernet0/3",
        "description SPARE-PORT"
    ]
}

AUTO01$ <span class="c"># run the exact same command again</span>
pun-core-r1 | <span class="hl">SUCCESS</span> =&gt; {
    "banners": {},
    "changed": false,
    "commands": [],
    "updates": []
}</pre>
<p>Look at the second run: the state is <b>SUCCESS</b>, <code>changed</code> is false and <code>commands</code> is empty. The module compared the running-config with your line, found it already present and sent nothing. This is <b>idempotency</b> in action, and it is why Ansible is safe to repeat.</p>

<h3>Reading the result words</h3>
<table class="cmp"><tr><th>Result</th><th>Meaning</th></tr>
<tr><td>SUCCESS</td><td>Ran, nothing changed (a read, or the device already matched).</td></tr>
<tr><td>CHANGED</td><td>Ran and modified the device.</td></tr>
<tr><td>FAILED</td><td>Logged in, but the task itself failed. Read <code>msg</code>.</td></tr>
<tr><td>UNREACHABLE</td><td>Could not connect at all (address, timeout, SSH).</td></tr></table>
<pre class="out">pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."
}
blr-edge-r2 | UNREACHABLE! =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p>The first is a device-side error: the CLI rejected the command. The second came from a wrong <code>ansible_host</code> address, so nothing answered. Telling these two apart is the first step in every troubleshooting session.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Using ad-hoc <code>ios_config</code> for big changes. It leaves no file to review, no history and no easy repeat. Use ad-hoc commands for checks and tiny fixes; put real changes in playbooks. Also remember quotes: the whole <code>-a</code> value goes in double quotes and the inner command in single quotes.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ansible all -m ping</code> on a network device is a login test, not an ICMP reachability test, and the module that runs show commands is <code>ios_command</code>, while <code>ios_config</code> changes configuration.</p></div>

<div class="scn"><h4>Is the whole estate reachable before the change window?</h4><p>Two hours before a maintenance window, a lead ran <code>ansible all -m ping -o</code> across eighty devices. Seventy-seven answered pong. Three printed UNREACHABLE with "Connection timed out"; all three belonged to one site whose firewall had a stale management rule. The network team fixed the rule, repeated the ping, and the change started on time with a clean baseline.</p><p><b>Lesson:</b> a one-line ad-hoc ping is a cheap pre-flight check. Run it before every change.</p></div>

<div class="iv"><p class="q">"When would you use an ad-hoc command instead of a playbook?"</p><p>For quick, one-off, low-risk jobs: testing login with ping, collecting show output with ios_command, or reading facts. Anything that changes configuration repeatedly, needs review or must be repeatable belongs in a playbook under version control. Mention that ios_config is still idempotent even ad hoc.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: <code>ansible PATTERN -m MODULE -a "ARGS"</code>.</li>
<li><code>ping</code> tests SSH login and CLI, not ICMP; <code>ios_command</code> reads; <code>ios_config</code> changes; <code>ios_facts</code> gathers facts.</li>
<li><code>stdout</code> is a list of strings; <code>stdout_lines</code> is a list of line lists.</li>
<li>CHANGED means it modified the device; a repeat gives SUCCESS with <code>changed: false</code>.</li>
<li>FAILED means a task error after login; UNREACHABLE means no connection.</li>
</ul></div>
`,hi:`
<p>Playbook likhne se pehle ek hi sentence bahut se devices ko bolkar unke jawab dekhna madad karta hai. <b>Ad-hoc command</b> yahi karta hai: ek module, ek run, koi file nahi. Ise aise samjho jaise routers se bhare kamre mein ek sawaal chillana: "Sab log apne interfaces dikhao", aur har router jawab deta hai. Ad-hoc commands connectivity check karne, ek fact nikaalne ya ek chhota sa change karne ka sabse tez tareeka hain.</p>

<h3>Ad-hoc command ki shape</h3>
<pre class="code">ansible  PATTERN  -m MODULE  -a "ARGUMENTS"
<span class="c">#        kaun     kaunsa worker  use kya dena hai</span></pre>
<ul>
<li><b>PATTERN</b> hosts chunta hai: <code>all</code>, <code>routers</code> jaisa group, ek inventory name, ya <code>routers:!edge</code> jaisa combination (edge group ko chhod kar routers). Agla module patterns ko gehrai se dekhta hai.</li>
<li><b>-m</b> module ka naam deta hai, behtar hai poore naam se.</li>
<li><b>-a</b> module ko arguments <code>key=value</code> pairs ke roop mein quotes ke andar deta hai.</li>
</ul>

<h3>1. ping: kya Ansible login kar sakta hai?</h3>
<p>Pichhle chapter mein yeh mila tha. Network device ke liye <code>ping</code> module ICMP <b>nahi</b> bhejta; woh SSH session kholta hai aur CLI check karta hai. <code>-o</code> flag har result ek line mein print karta hai, bahut devices ke liye kaam ka.</p>
<pre class="out">AUTO01$ ansible all -m ping -o
pun-core-r1 | SUCCESS =&gt; { "changed": false, "ping": "pong" }
blr-edge-r2 | SUCCESS =&gt; { "changed": false, "ping": "pong" }
pun-acc-sw1 | SUCCESS =&gt; { "changed": false, "ping": "pong" }</pre>

<h3>2. ios_command: show commands chalao</h3>
<p><code>cisco.ios.ios_command</code> <code>show</code> jaise exec-level commands chalata hai aur text lautata hai. Yeh configuration kabhi nahi badalta. Hum sirf <code>routers</code> group se poochte hain, to switch chup rehta hai.</p>
<pre class="out">AUTO01$ ansible routers -m cisco.ios.ios_command -a "commands='show ip interface brief'"
pun-core-r1 | SUCCESS =&gt; {
    "changed": false,
    "stdout": [
        "Interface              IP-Address      OK? Method Status                Protocol\\nGigabitEthernet0/0     10.99.0.1       YES manual up                    up\\nGigabitEthernet0/1     unassigned      YES unset  administratively down down\\n..."
    ],
    <span class="hl">"stdout_lines": [</span>
        [
            "Interface              IP-Address      OK? Method Status                Protocol",
            "GigabitEthernet0/0     10.99.0.1       YES manual up                    up",
            "GigabitEthernet0/1     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/2     unassigned      YES unset  administratively down down",
            "GigabitEthernet0/3     unassigned      YES unset  administratively down down"
        ]
    ]
}
blr-edge-r2 | SUCCESS =&gt; { ... same shape, Gi0/0 is 10.99.0.2 ... }</pre>
<p>(Output chhota kiya gaya: <code>stdout</code> text kata hua hai aur doosre router ka summary hai.) Text do fields mein hai. <code>stdout</code> <b>list hai jisme har command ki ek string</b> hoti hai; <code>stdout_lines</code> wahi text lines mein tuta hua, lists ki list. Output par react karne wale playbooks mein aap dono use karoge.</p>

<h3>3. ios_facts: facts collect karo</h3>
<p><b>Facts</b> device ki woh details hain jo Ansible jama karke aapke liye naam deta hai.</p>
<pre class="out">AUTO01$ ansible pun-core-r1 -m cisco.ios.ios_facts
pun-core-r1 | SUCCESS =&gt; {
    "ansible_facts": {
        "ansible_net_all_ipv4_addresses": [
            "10.99.0.1"
        ],
        "ansible_net_api": "cliconf",
        <span class="hl">"ansible_net_hostname": "PUN-CORE-R1",</span>
        ...
        "ansible_net_model": "ISR4331",
        ...
        "ansible_net_system": "ios",
        "ansible_net_version": "2.0"
    },
    "changed": false
}</pre>
<p>(Output dots se chhota kiya gaya.) Har fact <code>ansible_net_</code> se shuru hota hai. Aage ke chapters inhe conditions mein use karte hain, jaise "sirf naye software par chalao".</p>

<h3>4. ios_config: ek chhota change karo</h3>
<p><code>cisco.ios.ios_config</code> configuration lines bhejta hai. Jis interface ya section ki lines hain uske liye <code>parents</code> use karo. Yahan hum Pune router ke ek spare port ko label karte hain.</p>
<pre class="out">AUTO01$ ansible pun-core-r1 -m cisco.ios.ios_config -a "parents='interface GigabitEthernet0/3' lines='description SPARE-PORT'"
pun-core-r1 | <span class="hl">CHANGED</span> =&gt; {
    "banners": {},
    "changed": true,
    "commands": [
        "interface GigabitEthernet0/3",
        "description SPARE-PORT"
    ],
    "updates": [
        "interface GigabitEthernet0/3",
        "description SPARE-PORT"
    ]
}

AUTO01$ <span class="c"># bilkul wahi command dobara chalao</span>
pun-core-r1 | <span class="hl">SUCCESS</span> =&gt; {
    "banners": {},
    "changed": false,
    "commands": [],
    "updates": []
}</pre>
<p>Doosra run dekho: state <b>SUCCESS</b> hai, <code>changed</code> false hai aur <code>commands</code> khaali hai. Module ne running-config ko aapki line se compare kiya, line pehle se mili aur kuch nahi bheja. Yeh <b>idempotency</b> hai, aur isi wajah se Ansible ko repeat karna safe hai.</p>

<h3>Result ke shabd padhna</h3>
<table class="cmp"><tr><th>Result</th><th>Matlab</th></tr>
<tr><td>SUCCESS</td><td>Chala, kuch nahi badla (read, ya device pehle se match karta tha).</td></tr>
<tr><td>CHANGED</td><td>Chala aur device ko modify kiya.</td></tr>
<tr><td>FAILED</td><td>Login hua, par task khud fail hua. <code>msg</code> padho.</td></tr>
<tr><td>UNREACHABLE</td><td>Connect hi nahi hua (address, timeout, SSH).</td></tr></table>
<pre class="out">pun-core-r1 | FAILED! =&gt; {
    "changed": false,
    "msg": "command 'show ip bogus' failed: % Invalid input detected at '^' marker."
}
blr-edge-r2 | UNREACHABLE! =&gt; {
    "changed": false,
    "msg": "ssh connect failed: Connection timed out",
    "unreachable": true
}</pre>
<p>Pehla device-side error hai: CLI ne command reject kiya. Doosra galat <code>ansible_host</code> address se aaya, isliye kisi ne jawab nahi diya. In dono ko alag pehchanna har troubleshooting session ka pehla step hai.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Bade changes ke liye ad-hoc <code>ios_config</code> use karna. Isme review ke liye file nahi, history nahi aur aasaan repeat nahi. Ad-hoc commands checks aur chhote fixes ke liye; asli changes playbooks mein. Quotes bhi yaad rakho: poora <code>-a</code> value double quotes mein aur andar ka command single quotes mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Network device par <code>ansible all -m ping</code> login test hai, ICMP reachability test nahi, aur show commands chalane wala module <code>ios_command</code> hai, jabki <code>ios_config</code> configuration badalta hai.</p></div>

<div class="scn"><h4>Change window se pehle kya poora estate reachable hai?</h4><p>Maintenance window se do ghante pehle ek lead ne assi devices par <code>ansible all -m ping -o</code> chalaya. Sattahattar ne pong diya. Teen ne "Connection timed out" ke saath UNREACHABLE print kiya; teeno ek hi site ke the jiske firewall mein purana management rule tha. Network team ne rule theek kiya, ping dobara chalaya, aur change clean baseline ke saath time par shuru hua.</p><p><b>Lesson:</b> ek line ka ad-hoc ping sasta pre-flight check hai. Har change se pehle chalao.</p></div>

<div class="iv"><p class="q">"Playbook ki jagah ad-hoc command kab use karoge?"</p><p>Quick, ek baar ke, low-risk kaam ke liye: ping se login test, ios_command se show output, ya facts padhna. Jo configuration baar-baar badalta hai, review maangta hai ya repeatable hona chahiye woh version control mein playbook mein jaata hai. Yeh batao ki ios_config ad hoc mein bhi idempotent hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Format: <code>ansible PATTERN -m MODULE -a "ARGS"</code>.</li>
<li><code>ping</code> SSH login aur CLI test karta hai, ICMP nahi; <code>ios_command</code> padhta hai; <code>ios_config</code> badalta hai; <code>ios_facts</code> facts jama karta hai.</li>
<li><code>stdout</code> strings ki list hai; <code>stdout_lines</code> line lists ki list.</li>
<li>CHANGED matlab device badla; repeat par SUCCESS aur <code>changed: false</code>.</li>
<li>FAILED matlab login ke baad task error; UNREACHABLE matlab connection nahi.</li>
</ul></div>
`}};export{e as default};