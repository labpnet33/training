var e={id:`troubleshooting`,h:{en:`Troubleshooting: web-1 cannot be reached from the internet`,hi:`Troubleshooting: web-1 internet se reach nahi ho raha`},body:{en:`
<p>This chapter walks through Lab 2, ticket NK-6402. A colleague left a script, <code>fix.py</code>, that was meant to make the server <code>web-1</code> reachable on tcp/443. It does not work, and some of its mistakes do not even raise an error. The skill here is a method, not a lucky guess: check the layers in the order traffic meets them, and never trust "it ran without an error" as proof.</p>

<h3>An analogy: the courier at four doors</h3>
<p>A parcel from the street to your flat passes four doors: the colony gate, the building lobby, the flat door and finally your name on the bell. If the parcel is not delivered you do not repaint the flat. You walk the route and find the first door that is shut. A packet from the internet to web-1 passes four such doors too.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Four checks in the order traffic meets them">
<rect x="14" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="78" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 gateway</text>
<rect x="166" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="230" y="64" text-anchor="middle" class="svg-ink" font-size="12">2 route</text>
<rect x="318" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="382" y="64" text-anchor="middle" class="svg-ink" font-size="12">3 security group</text>
<rect x="470" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="534" y="64" text-anchor="middle" class="svg-ink" font-size="12">4 public IP</text>
<text x="146" y="64" class="svg-ink" font-size="16">&gt;</text><text x="298" y="64" class="svg-ink" font-size="16">&gt;</text><text x="450" y="64" class="svg-ink" font-size="16">&gt;</text>
<text x="14" y="112" class="svg-muted" font-size="12">internet side</text><text x="534" y="112" text-anchor="middle" class="svg-muted" font-size="12">web-1 side</text>
</svg></div>
<p class="cap">nkdiag.py tests these four in order. The first FAIL is where to start.</p>

<h3>Step 1: measure before you touch</h3>
<p>The lab gives you a read-only script, <code>nkdiag.py</code>, that asks boto3 four questions, and the lab tool <code>nk-probe</code>, which simulates a connection from the internet. Run both before changing anything.</p>
<pre class="out">AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[FAIL] 1 gateway  no internet gateway is attached to vpc-0b9e5ea8bb7b203bd
[FAIL] 2 route    shop-public-rt has no 0.0.0.0/0 route to an internet gateway
[FAIL] 3 sg       shop-web-sg allows tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[FAIL] 4 public ip web-1 has no public or Elastic IP
<span class="hl">0 of 4 checks pass</span>

AUTO01$ nk-probe internet web-1 443
Probing tcp/443 from the internet to web-1 (10.60.1.4) ...
  request <span class="hl">BLOCKED</span> VPC vpc-0b9e5ea8bb7b203bd has no internet gateway attached

Result: no connection (the request never reached the target)</pre>
<p>All four doors are shut, and the probe names the first one. Notice that the probe stops at the first problem, while <code>nkdiag.py</code> lists all of them. That is why you use both: the probe tells you what a packet meets first, the script tells you how much work there is.</p>

<h3>Fault 1: the typo that boto3 refuses (loud)</h3>
<p>The inherited script starts with the gateway. The line is wrong in one letter.</p>
<pre class="out">AUTO01$ python3 fix.py
Traceback (most recent call last):
  File "fix.py", line 50, in &lt;module&gt;
    print("%-12s %s" % (step.__name__, step()))
  File "fix.py", line 18, in fix_gateway
    ec2.attach_internet_gateway(InternetGatewayID=igw, VpcId=vpc)
  File "/usr/lib/python3.11/botocore/client.py", line 173, in attach_internet_gateway
    return client._make_api_call(op, kwargs)
  File "/usr/lib/python3.11/botocore/client.py", line 258, in _make_api_call
    nkmodel.validate(svc, spec, params)
  File "/usr/lib/python3.11/botocore/nkmodel.py", line 378, in validate
    raise ParamValidationError(report='\\n'.join(errors))
botocore.exceptions.ParamValidationError: Parameter validation failed:
Missing required parameter in input: "InternetGatewayId"
<span class="hl">Unknown parameter in input: "InternetGatewayID", must be one of: DryRun, InternetGatewayId, VpcId</span></pre>
<p>This is the friendliest kind of failure. <code>ParamValidationError</code> is raised on your machine, before any request is sent, and the last line lists the allowed names. Capital <code>ID</code> should be <code>Id</code>. Parameter names are case-sensitive. Fix it with one <code>sed</code> command and run again.</p>
<pre class="out">AUTO01$ sed -i "s/InternetGatewayID/InternetGatewayId/" fix.py
AUTO01$ python3 fix.py
fix_gateway  attached igw-cf6fb5f645e54534c
fix_route    0.0.0.0/0 -&gt; igw-cf6fb5f645e54534c in rtb-4075f387b3ca414ae
fix_sg       tcp/443 opened on sg-a43e8de50616f91e8
fix_address  <span class="hl">FAILED AddressLimitExceeded</span>: The maximum number of addresses has been reached.</pre>
<p>Three steps say "done" and one says FAILED. It is tempting to stop here and blame the Elastic IP. Do not. Ask the measuring tool first.</p>

<h3>Faults 2 and 3: success on the wrong object (silent)</h3>
<pre class="out">AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[PASS] 1 gateway  shop-igw is attached to vpc-0b9e5ea8bb7b203bd
[FAIL] 2 route    shop-public-rt has no 0.0.0.0/0 route to an internet gateway
[FAIL] 3 sg       shop-web-sg allows tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[FAIL] 4 public ip web-1 has no public or Elastic IP
<span class="hl">1 of 4 checks pass</span></pre>
<p>Only the gateway is fixed. The route step printed success, yet the check still fails. The reason is in the script: it looks up a table named <code>shop-spare-rt</code>, which is a different table, not the one web-1's subnet uses. The route was created correctly, in the wrong place. The security-group step has the same shape: it searched by the group name <code>default</code>, so tcp/443 was opened on the default group, while web-1 uses <code>shop-web-sg</code>. No API ever complains, because every call was valid.</p>
<p>This is the lesson of the chapter: <b>a call that succeeds proves only that the call was valid, not that it was aimed at the right object.</b> Always verify with a read from the point of view of the thing you wanted to change. Both mistakes are one word in the script:</p>
<pre class="out">AUTO01$ sed -i "s/shop-spare-rt/shop-public-rt/" fix.py
AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    0.0.0.0/0 -&gt; igw-cf6fb5f645e54534c in rtb-3b6cc430ad9368ff6
fix_sg       tcp/443 already open on sg-a43e8de50616f91e8
fix_address  FAILED AddressLimitExceeded: The maximum number of addresses has been reached.

AUTO01$ sed -i "s/\\"default\\", \\"group-name\\"/\\"shop-web-sg\\", \\"group-name\\"/" fix.py
AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    <span class="hl">route already there</span>
fix_sg       tcp/443 opened on sg-0356d48e244d6e278
fix_address  FAILED AddressLimitExceeded: The maximum number of addresses has been reached.</pre>
<p>Look at how the script reports "already attached", "route already there" and "tcp/443 already open". Those words come from a pre-check before each change, which makes the script <b>idempotent</b>: you can run it again and again without a second create or a Duplicate error. Good fix scripts are written that way.</p>

<h3>Fault 4: the leaked address (a limit, not a bug)</h3>
<p><code>AddressLimitExceeded</code> is not about your code. The account is allowed a fixed number of Elastic IPs, and one is already used. Ask who holds it. The helper <code>leaks.py</code> lists addresses that are attached to nothing.</p>
<pre class="out">AUTO01$ python3 leaks.py
unattached eipalloc-92d7148437e841c97 13.219.134.248
1 unattached address(es)

AUTO01$ python3 leaks.py --release
unattached eipalloc-92d7148437e841c97 13.219.134.248
released eipalloc-92d7148437e841c97
1 unattached address(es)</pre>
<p>Someone allocated an address earlier and never attached or released it, exactly the leak chapter 8 warned about. Releasing it frees the quota. Note the habit: the first run only lists, and <code>--release</code> is an explicit second step. A tool that deletes should be asked to.</p>

<h3>Step 5: prove it, then prove it stays fixed</h3>
<pre class="out">AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    route already there
fix_sg       tcp/443 already open on sg-0356d48e244d6e278
fix_address  <span class="hl">associated 13.223.162.50</span>

AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[PASS] 1 gateway  shop-igw is attached to vpc-0b9e5ea8bb7b203bd
[PASS] 2 route    shop-public-rt has a 0.0.0.0/0 route to an internet gateway
[PASS] 3 sg       shop-web-sg allows tcp/443, tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[PASS] 4 public ip web-1 has 13.223.162.50
<span class="hl">4 of 4 checks pass</span>

AUTO01$ nk-probe internet web-1 443
Probing tcp/443 from the internet to web-1 (10.60.1.4) ...
  request ok      security group sg-0356d48e244d6e278 (in) allows
  reply   ok      returned to the sender

Result: connected</pre>
<p>Two independent witnesses agree: the boto3 audit says 4 of 4, and the probe says connected. Then one more run of <code>fix.py</code> printed "already" four times, which shows the script is safe to repeat.</p>

<h3>The workflow in short</h3>
<ol>
<li><b>Measure</b> with a read-only script and a probe. Write down the first failing layer.</li>
<li><b>Fix one layer</b>, then <b>measure again</b>. A loud error (ParamValidationError, ClientError) is easy; a quiet one needs the second measurement.</li>
<li>When a call "works" but nothing changes, <b>check the target</b>: names, IDs, which table, which group.</li>
<li>When you hit a limit, <b>find the owner</b> of the used quota before asking for more.</li>
<li>Finish with <b>two witnesses</b> and a repeat run that changes nothing.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Allocating a new address, or opening 0.0.0.0/0, to "get past" a failure. That hides the cause and adds a leak or a hole. Find the cause first.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ParamValidationError</code> is client-side and never reaches AWS. <code>ClientError</code> comes back from the service. Wrong-target success raises neither.</p></div>

<div class="scn"><h4>The fix that fixed the wrong table</h4><p>A night engineer ran a fix script, saw three green lines and closed the ticket. At 9 am the shop was still down. The script had added the default route to a spare table that no subnet used. A 10-line diagnostic like nkdiag.py, run after the change, would have caught it in seconds.</p><p><b>Lesson:</b> the ticket closes on the measurement, not on the script's output.</p></div>

<div class="iv"><p class="q">"A script created the route without an error but the server is still unreachable. What do you do?"</p><p>I treat the success as unproven. I read back the route table that the server's subnet is actually associated with, and compare IDs with the one the script changed. Then I check the security group on the instance, and the public IP. I fix the target, re-run the read-only check, and confirm with a connection test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check the layers in the order traffic meets them: gateway, route, security group, public IP.</li>
<li>ParamValidationError is a local, case-sensitive parameter name problem; read the list at the end of the message.</li>
<li>A successful call can still be aimed at the wrong table or group; verify by reading back.</li>
<li>AddressLimitExceeded means find the leaked address first; release only on purpose.</li>
<li>Finish with two witnesses and an idempotent re-run.</li>
</ul></div>
`,hi:`
<p>Yeh chapter Lab 2, ticket NK-6402, ko walk karta hai. Ek colleague ek script, <code>fix.py</code>, chhod gaya jo server <code>web-1</code> ko tcp/443 par reachable banane wali thi. Woh kaam nahi karti, aur uski kuch galtiyan error bhi nahi deti. Yahan skill ek method hai, andaza nahi: layers ko us order mein check karo jis order mein traffic unse milta hai, aur "bina error ke chal gaya" ko kabhi saboot mat maano.</p>

<h3>Analogy: chaar darwazon par courier</h3>
<p>Sadak se aapke flat tak ek parcel chaar darwazon se guzarta hai: colony ka gate, building ki lobby, flat ka darwaza aur aakhir mein bell par aapka naam. Parcel deliver na ho to aap flat ko dobara paint nahi karte. Aap raasta chalte ho aur pehla band darwaza dhoondhte ho. Internet se web-1 tak packet bhi aise hi chaar darwazon se guzarta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Traffic jis order mein milta hai us order mein chaar checks">
<rect x="14" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="78" y="64" text-anchor="middle" class="svg-ink" font-size="12">1 gateway</text>
<rect x="166" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="230" y="64" text-anchor="middle" class="svg-ink" font-size="12">2 route</text>
<rect x="318" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="382" y="64" text-anchor="middle" class="svg-ink" font-size="12">3 security group</text>
<rect x="470" y="40" width="128" height="40" rx="6" fill="#bae6fd"/><text x="534" y="64" text-anchor="middle" class="svg-ink" font-size="12">4 public IP</text>
<text x="146" y="64" class="svg-ink" font-size="16">&gt;</text><text x="298" y="64" class="svg-ink" font-size="16">&gt;</text><text x="450" y="64" class="svg-ink" font-size="16">&gt;</text>
<text x="14" y="112" class="svg-muted" font-size="12">internet ki taraf</text><text x="534" y="112" text-anchor="middle" class="svg-muted" font-size="12">web-1 ki taraf</text>
</svg></div>
<p class="cap">nkdiag.py in chaaron ko order mein test karti hai. Pehla FAIL wahi hai jahan se shuru karna hai.</p>

<h3>Step 1: chhune se pehle naapo</h3>
<p>Lab aapko ek read-only script, <code>nkdiag.py</code>, deti hai jo boto3 se chaar sawal poochti hai, aur lab tool <code>nk-probe</code>, jo internet se connection simulate karta hai. Kuch badalne se pehle dono chalao.</p>
<pre class="out">AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[FAIL] 1 gateway  no internet gateway is attached to vpc-0b9e5ea8bb7b203bd
[FAIL] 2 route    shop-public-rt has no 0.0.0.0/0 route to an internet gateway
[FAIL] 3 sg       shop-web-sg allows tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[FAIL] 4 public ip web-1 has no public or Elastic IP
<span class="hl">0 of 4 checks pass</span>

AUTO01$ nk-probe internet web-1 443
Probing tcp/443 from the internet to web-1 (10.60.1.4) ...
  request <span class="hl">BLOCKED</span> VPC vpc-0b9e5ea8bb7b203bd has no internet gateway attached

Result: no connection (the request never reached the target)</pre>
<p>Chaaron darwaze band hain, aur probe pehle ka naam batata hai. Dhyan do ki probe pehli problem par ruk jata hai, jabki <code>nkdiag.py</code> sab ki list deti hai. Isliye dono use karte hain: probe batata hai packet ko pehle kya milta hai, script batati hai kitna kaam hai.</p>

<h3>Fault 1: woh typo jise boto3 mana kar deta hai (loud)</h3>
<p>Inherited script gateway se shuru hoti hai. Line mein ek akshar galat hai.</p>
<pre class="out">AUTO01$ python3 fix.py
Traceback (most recent call last):
  File "fix.py", line 50, in &lt;module&gt;
    print("%-12s %s" % (step.__name__, step()))
  File "fix.py", line 18, in fix_gateway
    ec2.attach_internet_gateway(InternetGatewayID=igw, VpcId=vpc)
  File "/usr/lib/python3.11/botocore/client.py", line 173, in attach_internet_gateway
    return client._make_api_call(op, kwargs)
  File "/usr/lib/python3.11/botocore/client.py", line 258, in _make_api_call
    nkmodel.validate(svc, spec, params)
  File "/usr/lib/python3.11/botocore/nkmodel.py", line 378, in validate
    raise ParamValidationError(report='\\n'.join(errors))
botocore.exceptions.ParamValidationError: Parameter validation failed:
Missing required parameter in input: "InternetGatewayId"
<span class="hl">Unknown parameter in input: "InternetGatewayID", must be one of: DryRun, InternetGatewayId, VpcId</span></pre>
<p>Yeh sabse dostana failure hai. <code>ParamValidationError</code> aapki machine par hi uthta hai, koi request bhejne se pehle, aur aakhri line allowed naam batati hai. Capital <code>ID</code> ko <code>Id</code> hona chahiye. Parameter ke naam case-sensitive hote hain. Ek <code>sed</code> command se theek karo aur dobara chalao.</p>
<pre class="out">AUTO01$ sed -i "s/InternetGatewayID/InternetGatewayId/" fix.py
AUTO01$ python3 fix.py
fix_gateway  attached igw-cf6fb5f645e54534c
fix_route    0.0.0.0/0 -&gt; igw-cf6fb5f645e54534c in rtb-4075f387b3ca414ae
fix_sg       tcp/443 opened on sg-a43e8de50616f91e8
fix_address  <span class="hl">FAILED AddressLimitExceeded</span>: The maximum number of addresses has been reached.</pre>
<p>Teen steps "done" kehte hain aur ek FAILED. Yahin ruk kar Elastic IP ko doshi thehraana lubhaavna hai. Aisa mat karo. Pehle measuring tool se poocho.</p>

<h3>Faults 2 aur 3: galat object par success (silent)</h3>
<pre class="out">AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[PASS] 1 gateway  shop-igw is attached to vpc-0b9e5ea8bb7b203bd
[FAIL] 2 route    shop-public-rt has no 0.0.0.0/0 route to an internet gateway
[FAIL] 3 sg       shop-web-sg allows tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[FAIL] 4 public ip web-1 has no public or Elastic IP
<span class="hl">1 of 4 checks pass</span></pre>
<p>Sirf gateway theek hua. Route step ne success print kiya, phir bhi check fail hai. Wajah script mein hai: woh <code>shop-spare-rt</code> naam ki table dhoondhti hai, jo alag table hai, woh nahi jo web-1 ka subnet use karta hai. Route sahi bana, galat jagah par. Security-group step ki shakal bhi wahi hai: usne group naam <code>default</code> se search kiya, isliye tcp/443 default group par khula, jabki web-1 <code>shop-web-sg</code> use karta hai. Koi API shikayat nahi karti, kyunki har call valid thi.</p>
<p>Is chapter ka sabak yahi hai: <b>jo call succeed hoti hai woh sirf yeh saabit karti hai ki call valid thi, yeh nahi ki woh sahi object par thi.</b> Hamesha us cheez ki nazar se read karke verify karo jise aap badalna chahte the. Dono galtiyan script mein ek-ek shabd ki hain:</p>
<pre class="out">AUTO01$ sed -i "s/shop-spare-rt/shop-public-rt/" fix.py
AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    0.0.0.0/0 -&gt; igw-cf6fb5f645e54534c in rtb-3b6cc430ad9368ff6
fix_sg       tcp/443 already open on sg-a43e8de50616f91e8
fix_address  FAILED AddressLimitExceeded: The maximum number of addresses has been reached.

AUTO01$ sed -i "s/\\"default\\", \\"group-name\\"/\\"shop-web-sg\\", \\"group-name\\"/" fix.py
AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    <span class="hl">route already there</span>
fix_sg       tcp/443 opened on sg-0356d48e244d6e278
fix_address  FAILED AddressLimitExceeded: The maximum number of addresses has been reached.</pre>
<p>Dekho script "already attached", "route already there" aur "tcp/443 already open" kaise report karti hai. Yeh shabd har change se pehle ke pre-check se aate hain, jo script ko <b>idempotent</b> banata hai: aap use baar-baar chala sakte ho bina doosra create ya Duplicate error ke. Achhi fix scripts aise hi likhi jaati hain.</p>

<h3>Fault 4: leak hua address (bug nahi, limit)</h3>
<p><code>AddressLimitExceeded</code> aapke code ke baare mein nahi hai. Account ko Elastic IPs ki fixed sankhya ki ijazat hai, aur ek pehle se use ho chuka hai. Poochho kiske paas hai. Helper <code>leaks.py</code> woh addresses list karta hai jo kisi se attach nahi hain.</p>
<pre class="out">AUTO01$ python3 leaks.py
unattached eipalloc-92d7148437e841c97 13.219.134.248
1 unattached address(es)

AUTO01$ python3 leaks.py --release
unattached eipalloc-92d7148437e841c97 13.219.134.248
released eipalloc-92d7148437e841c97
1 unattached address(es)</pre>
<p>Kisi ne pehle address allocate kiya aur use kabhi attach ya release nahi kiya, bilkul wahi leak jiske baare mein chapter 8 ne chetaya tha. Release karne se quota khali hota hai. Aadat dekho: pehli run sirf list karti hai, aur <code>--release</code> ek alag, jaan-boojh kar liya gaya step hai. Jo tool delete karta hai use maangne par hi delete karna chahiye.</p>

<h3>Step 5: saabit karo, phir saabit karo ki theek rehta hai</h3>
<pre class="out">AUTO01$ python3 fix.py
fix_gateway  already attached
fix_route    route already there
fix_sg       tcp/443 already open on sg-0356d48e244d6e278
fix_address  <span class="hl">associated 13.223.162.50</span>

AUTO01$ python3 nkdiag.py
web-1 i-8576de2fb0af7f797 in subnet-481ada7c60da27264 of vpc-0b9e5ea8bb7b203bd
[PASS] 1 gateway  shop-igw is attached to vpc-0b9e5ea8bb7b203bd
[PASS] 2 route    shop-public-rt has a 0.0.0.0/0 route to an internet gateway
[PASS] 3 sg       shop-web-sg allows tcp/443, tcp/8443 (needed: tcp/443 from 0.0.0.0/0)
[PASS] 4 public ip web-1 has 13.223.162.50
<span class="hl">4 of 4 checks pass</span>

AUTO01$ nk-probe internet web-1 443
Probing tcp/443 from the internet to web-1 (10.60.1.4) ...
  request ok      security group sg-0356d48e244d6e278 (in) allows
  reply   ok      returned to the sender

Result: connected</pre>
<p>Do swatantra gawah sehmat hain: boto3 audit kehta hai 4 of 4, aur probe kehta hai connected. Phir <code>fix.py</code> ki ek aur run ne chaar baar "already" print kiya, jo dikhata hai ki script dohraana safe hai.</p>

<h3>Workflow sankshep mein</h3>
<ol>
<li>Read-only script aur probe se <b>naapo</b>. Pehli failing layer likh lo.</li>
<li><b>Ek layer theek karo</b>, phir <b>dobara naapo</b>. Loud error (ParamValidationError, ClientError) aasaan hai; quiet error ko doosre measurement ki zaroorat hoti hai.</li>
<li>Jab call "chal" jaye par kuch badle nahi, <b>target check karo</b>: naam, IDs, kaun si table, kaun sa group.</li>
<li>Limit lage to zyada maangne se pehle use ho chuke quota ka <b>maalik dhoondho</b>.</li>
<li>Do gawahon aur aisi repeat run se khatam karo jo kuch nahi badalti.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Failure se "nikalne" ke liye naya address allocate karna, ya 0.0.0.0/0 kholna. Isse wajah chhup jaati hai aur ek leak ya hole jud jata hai. Pehle wajah dhoondho.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>ParamValidationError</code> client-side hai aur AWS tak nahi pahunchta. <code>ClientError</code> service se wapas aata hai. Galat-target success dono mein se kuch nahi uthata.</p></div>

<div class="scn"><h4>Woh fix jisne galat table theek ki</h4><p>Ek raat ke engineer ne fix script chalayi, teen hari lines dekhi aur ticket band kar diya. Subah 9 baje bhi shop down tha. Script ne default route ek spare table mein daal diya tha jise koi subnet use nahi karta. Change ke baad chalayi gayi nkdiag.py jaisi 10-line diagnostic ise seconds mein pakad leti.</p><p><b>Lesson:</b> ticket measurement par band hota hai, script ke output par nahi.</p></div>

<div class="iv"><p class="q">"Ek script ne bina error ke route banaya par server abhi bhi unreachable hai. Aap kya karte ho?"</p><p>Main success ko unproven maanta hoon. Server ke subnet se asal mein associated route table ko read karta hoon, aur IDs ko us table se compare karta hoon jise script ne badla. Phir instance par security group aur public IP check karta hoon. Target theek karta hoon, read-only check dobara chalata hoon, aur connection test se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers us order mein check karo jis order mein traffic milta hai: gateway, route, security group, public IP.</li>
<li>ParamValidationError local, case-sensitive parameter naam ki problem hai; message ke aakhir ki list padho.</li>
<li>Safal call bhi galat table ya group par ho sakti hai; wapas read karke verify karo.</li>
<li>AddressLimitExceeded ka matlab pehle leak hua address dhoondho; release sirf jaan-boojh kar karo.</li>
<li>Do gawahon aur idempotent re-run se khatam karo.</li>
</ul></div>
`}};export{e as default};