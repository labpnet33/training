var e={id:`workload-app-ebpf`,h:{en:`Application and workload security, and eBPF`,hi:`Application aur workload security, aur eBPF`},body:{en:`
<p>Protecting a shop means more than a lock on the front door. You buy shelves that are hard to break (hardened images), fix broken windows quickly (patching), keep the cash in a safe rather than the drawer (secrets management), put a camera inside (runtime protection) and a guard who checks every customer at the counter (WAF and API security). Workload and application security is the same set of layers for a server, container or function.</p>

<h3>Layer 1: build it hard</h3>
<ul>
<li><b>Golden images</b>: one approved, hardened base image per OS, built to the <b>CIS Benchmark</b>, rebuilt monthly, with unused services removed.</li>
<li><b>Immutable infrastructure</b>: you do not patch a running server by hand; you build a new image and replace the instances. Drift disappears.</li>
<li><b>Vulnerability management</b>: scan images in the registry and running workloads, prioritise with CVSS, EPSS, KEV and exposure (sec-concepts).</li>
</ul>

<h3>Layer 2: keep secrets out of code</h3>
<p>Passwords, API tokens and private keys belong in a <b>secrets manager</b> (a vault or the provider's secrets service), fetched at runtime by a workload identity, rotated automatically and never written to Git, container images or plain environment files. Pair this with secret scanning in the pipeline (chapter 9).</p>

<h3>Layer 3: protect the application</h3>
<table class="cmp"><tr><th>Control</th><th>What it does</th><th>Example threat stopped</th></tr>
<tr><td><b>WAF</b></td><td>Inspects HTTP requests in front of the app, with signatures and anomaly rules</td><td>SQL injection, cross-site scripting, known exploit strings</td></tr>
<tr><td><b>API security / API gateway</b></td><td>Authentication, rate limits, schema validation, discovery of shadow APIs</td><td>Broken object-level authorisation, credential stuffing on login APIs</td></tr>
<tr><td><b>RASP</b></td><td>Runtime Application Self-Protection inside the app process</td><td>An injection reaching the database driver</td></tr>
<tr><td><b>Secure coding</b></td><td>Input validation, parameterised queries, output encoding, least-privilege service accounts</td><td>The whole OWASP Top 10 at the source</td></tr>
</table>

<h3>Layer 4: watch it run (CWPP and EDR)</h3>
<p>Runtime protection watches process launches, file changes and network connections on the workload: a web server that suddenly spawns a shell, a container that writes into <code>/usr/bin</code>, a process that connects to a mining pool. On servers this is EDR or a CWPP agent; Cisco Secure Endpoint covers servers as well as laptops.</p>

<h3>eBPF: programmable security inside the kernel</h3>
<p><b>eBPF</b> (extended Berkeley Packet Filter) lets small programs run <b>inside the Linux kernel</b> safely, without writing a kernel module or rebooting. Before a program loads, the kernel's <b>verifier</b> proves it cannot crash the kernel or loop forever; then it is JIT-compiled to native code. Programs attach to <b>hook points</b> and share data with user space through <b>maps</b>.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="eBPF hook points">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">User space: agent (Cilium, Tetragon, Hypershield) reads maps and events</text>
<rect x="10" y="65" width="620" height="140" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Linux kernel (verifier checks every program)</text>
<rect x="25" y="100" width="140" height="45" rx="8" fill="#bae6fd"/><text x="95" y="127" text-anchor="middle" class="svg-ink" font-size="12">XDP / tc: packets</text>
<rect x="180" y="100" width="140" height="45" rx="8" fill="#bbf7d0"/><text x="250" y="127" text-anchor="middle" class="svg-ink" font-size="12">sockets, cgroups</text>
<rect x="335" y="100" width="140" height="45" rx="8" fill="#fde68a"/><text x="405" y="127" text-anchor="middle" class="svg-ink" font-size="12">syscalls, kprobes</text>
<rect x="490" y="100" width="125" height="45" rx="8" fill="#fed7aa"/><text x="552" y="127" text-anchor="middle" class="svg-ink" font-size="12">LSM hooks</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">filter, observe and enforce without kernel modules</text>
</svg><p class="cap">eBPF programs attach where the kernel handles packets, sockets, system calls and security decisions.</p></div>
<p>Security uses of eBPF:</p>
<ul>
<li><b>Fast packet filtering</b> at the network driver with XDP (for example dropping a DDoS flood before the kernel stack spends any work on it).</li>
<li><b>Per-process network visibility</b>: which binary in which container opened which connection.</li>
<li><b>Runtime threat detection and enforcement</b>: watch system calls and file access, and block, for example, a process writing to sensitive files.</li>
<li><b>Kubernetes network policy</b> enforced per pod by identity rather than by iptables chains.</li>
</ul>
<p>In the Cisco portfolio: <b>Isovalent</b> (acquired by Cisco) created <b>Cilium</b>, the eBPF-based Kubernetes networking, observability and security layer, and <b>Tetragon</b>, eBPF runtime security observability and enforcement. <b>Cisco Hypershield</b> uses eBPF to place enforcement points inside workloads and network devices, managed as one distributed fabric.</p>

<pre class="code"><span class="c">! On a Linux host: list loaded eBPF programs (read-only check)</span>
sudo bpftool prog show</pre>
<pre class="out">48: <span class="hl">xdp</span>  name xdp_ddos_drop  tag 3b185187f1855c4c  gpl
	loaded_at 2026-09-29T03:10:11+0000  uid 0
	xlated 312B  jited 196B  memlock 4096B  map_ids 11
57: cgroup_skb  name egress_policy  tag 6deef7357e7b4530  gpl
	loaded_at 2026-09-29T03:10:12+0000  uid 0</pre>

<div class="eg"><p><b>Worked example.</b> A Kubernetes node runs 80 pods. Traditional kube-proxy plus iptables network policy can mean thousands of iptables rules evaluated in order. With an eBPF data plane, policy is looked up by pod identity in a hash map, so lookups stay fast as the cluster grows, and every allowed or dropped flow can be reported with the pod and process name.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking eBPF is "a firewall product". It is a kernel technology that products use. Another mistake: putting secrets in container images "just for the test environment"; images are copied to registries and laptops and the secret travels with them.</p></div>
<div class="exam"><p><b>Exam traps.</b> eBPF programs run in the kernel after the verifier approves them, with no kernel module needed. WAF protects HTTP applications in front of them; RASP runs inside the application. Secrets belong in a vault, never in code or images.</p></div>

<div class="scn"><h4>The web shell that never got a shell</h4><p>Attackers uploaded a web shell to a PHP application in a container through a vulnerable file-upload form. When they tried to run commands, the runtime security policy (eBPF-based) saw the web server process spawning <code>/bin/sh</code>, which the policy forbids for that workload, and killed the process. The event reached the SIEM with the pod name, image digest and the parent process. The team fixed the upload validation, added a WAF rule for the upload path and rebuilt the image.</p><p><b>Lesson:</b> preventive application controls and runtime enforcement work together; the second catches what the first missed.</p></div>

<div class="iv"><p class="q">"What is eBPF and why are security vendors excited about it?"</p><p>eBPF lets verified, sandboxed programs run inside the Linux kernel at hook points such as the network driver, sockets, system calls and LSM, without kernel modules. That gives deep visibility (which process opened which connection) and fast enforcement (drop at XDP, block a syscall) with low overhead. Name Cilium and Tetragon from Isovalent and Cisco Hypershield as examples.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers: hardened golden images, patching, secrets in a vault, WAF/API security/RASP, runtime protection.</li>
<li>Immutable infrastructure replaces instances instead of patching them by hand.</li>
<li>eBPF runs verified programs in the kernel at packet, socket, syscall and LSM hooks.</li>
<li>Cilium and Tetragon (Isovalent) and Cisco Hypershield are eBPF-based.</li>
<li>WAF sits in front of the app, RASP inside it, EDR/CWPP on the host.</li>
</ul></div>
`,hi:`
<p>Dukaan ko protect karna sirf front door par taala lagana nahi hai. Aap aisi shelves kharidte ho jo aasani se na tootein (hardened images), tooti khidkiyan jaldi theek karte ho (patching), cash drawer ki jagah safe mein rakhte ho (secrets management), andar camera lagate ho (runtime protection) aur counter par ek guard jo har customer ko check kare (WAF aur API security). Workload aur application security server, container ya function ke liye yahi layers hain.</p>

<h3>Layer 1: mazboot banao</h3>
<ul>
<li><b>Golden images</b>: har OS ke liye ek approved, hardened base image, <b>CIS Benchmark</b> ke hisaab se bani, har mahine rebuild hoti hai, unused services hataye hue.</li>
<li><b>Immutable infrastructure</b>: chalte server ko haath se patch nahi karte; nayi image banate ho aur instances replace karte ho. Drift khatam.</li>
<li><b>Vulnerability management</b>: registry mein images aur chalte workloads scan karo, CVSS, EPSS, KEV aur exposure se prioritise karo (sec-concepts).</li>
</ul>

<h3>Layer 2: secrets ko code se bahar rakho</h3>
<p>Passwords, API tokens aur private keys <b>secrets manager</b> (vault ya provider ki secrets service) mein hone chahiye, runtime par workload identity se fetch hon, apne aap rotate hon aur kabhi Git, container images ya plain environment files mein na likhe jaayen. Iske saath pipeline mein secret scanning jodo (chapter 9).</p>

<h3>Layer 3: application ko protect karo</h3>
<table class="cmp"><tr><th>Control</th><th>Kya karta hai</th><th>Kaunsa threat rokta hai</th></tr>
<tr><td><b>WAF</b></td><td>App ke aage HTTP requests ko signatures aur anomaly rules se inspect karta hai</td><td>SQL injection, cross-site scripting, known exploit strings</td></tr>
<tr><td><b>API security / API gateway</b></td><td>Authentication, rate limits, schema validation, shadow APIs ki discovery</td><td>Broken object-level authorisation, login APIs par credential stuffing</td></tr>
<tr><td><b>RASP</b></td><td>App process ke andar Runtime Application Self-Protection</td><td>Database driver tak pahunchta injection</td></tr>
<tr><td><b>Secure coding</b></td><td>Input validation, parameterised queries, output encoding, least-privilege service accounts</td><td>Source par hi poora OWASP Top 10</td></tr>
</table>

<h3>Layer 4: chalte hue dekho (CWPP aur EDR)</h3>
<p>Runtime protection workload par process launches, file changes aur network connections dekhta hai: web server jo achanak shell spawn kare, container jo <code>/usr/bin</code> mein likhe, process jo mining pool se connect kare. Servers par yeh EDR ya CWPP agent hai; Cisco Secure Endpoint laptops ke saath servers bhi cover karta hai.</p>

<h3>eBPF: kernel ke andar programmable security</h3>
<p><b>eBPF</b> (extended Berkeley Packet Filter) chhote programs ko <b>Linux kernel ke andar</b> safely chalane deta hai, bina kernel module likhe ya reboot kiye. Program load hone se pehle kernel ka <b>verifier</b> prove karta hai ki woh kernel crash nahi kar sakta ya hamesha loop nahi karega; phir woh native code mein JIT-compile hota hai. Programs <b>hook points</b> par attach hote hain aur <b>maps</b> ke through user space ke saath data share karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="eBPF hook points">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">User space: agent (Cilium, Tetragon, Hypershield) maps aur events padhta hai</text>
<rect x="10" y="65" width="620" height="140" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Linux kernel (verifier har program check karta hai)</text>
<rect x="25" y="100" width="140" height="45" rx="8" fill="#bae6fd"/><text x="95" y="127" text-anchor="middle" class="svg-ink" font-size="12">XDP / tc: packets</text>
<rect x="180" y="100" width="140" height="45" rx="8" fill="#bbf7d0"/><text x="250" y="127" text-anchor="middle" class="svg-ink" font-size="12">sockets, cgroups</text>
<rect x="335" y="100" width="140" height="45" rx="8" fill="#fde68a"/><text x="405" y="127" text-anchor="middle" class="svg-ink" font-size="12">syscalls, kprobes</text>
<rect x="490" y="100" width="125" height="45" rx="8" fill="#fed7aa"/><text x="552" y="127" text-anchor="middle" class="svg-ink" font-size="12">LSM hooks</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">bina kernel modules ke filter, observe aur enforce</text>
</svg><p class="cap">eBPF programs wahan attach hote hain jahan kernel packets, sockets, system calls aur security decisions handle karta hai.</p></div>
<p>eBPF ke security uses:</p>
<ul>
<li>Network driver par XDP se <b>fast packet filtering</b> (jaise DDoS flood ko kernel stack ke kaam karne se pehle hi drop karna).</li>
<li><b>Per-process network visibility</b>: kis container ki kaunsi binary ne kaunsa connection khola.</li>
<li><b>Runtime threat detection aur enforcement</b>: system calls aur file access dekhna, aur block karna, jaise sensitive files mein likhne wala process.</li>
<li>Har pod par iptables chains ki jagah identity se enforce hui <b>Kubernetes network policy</b>.</li>
</ul>
<p>Cisco portfolio mein: <b>Isovalent</b> (Cisco ne acquire kiya) ne <b>Cilium</b> banaya, jo eBPF-based Kubernetes networking, observability aur security layer hai, aur <b>Tetragon</b>, jo eBPF runtime security observability aur enforcement hai. <b>Cisco Hypershield</b> eBPF use karke workloads aur network devices ke andar enforcement points rakhta hai, ek distributed fabric ke roop mein managed.</p>

<pre class="code"><span class="c">! Linux host par: loaded eBPF programs list karo (read-only check)</span>
sudo bpftool prog show</pre>
<pre class="out">48: <span class="hl">xdp</span>  name xdp_ddos_drop  tag 3b185187f1855c4c  gpl
	loaded_at 2026-09-29T03:10:11+0000  uid 0
	xlated 312B  jited 196B  memlock 4096B  map_ids 11
57: cgroup_skb  name egress_policy  tag 6deef7357e7b4530  gpl
	loaded_at 2026-09-29T03:10:12+0000  uid 0</pre>

<div class="eg"><p><b>Worked example.</b> Ek Kubernetes node par 80 pods chalte hain. Traditional kube-proxy plus iptables network policy ka matlab ho sakta hai hazaaron iptables rules jo order mein evaluate hote hain. eBPF data plane ke saath policy hash map mein pod identity se lookup hoti hai, isliye cluster badhne par bhi lookups fast rehte hain, aur har allowed ya dropped flow pod aur process name ke saath report ho sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki eBPF "ek firewall product" hai. Yeh kernel technology hai jo products use karte hain. Ek aur galti: "sirf test environment ke liye" container images mein secrets daal dena; images registries aur laptops par copy hoti hain aur secret unke saath safar karta hai.</p></div>
<div class="exam"><p><b>Exam traps.</b> eBPF programs verifier ke approve karne ke baad kernel mein chalte hain, kernel module ki zaroorat nahi. WAF HTTP applications ko unke aage se protect karta hai; RASP application ke andar chalta hai. Secrets vault mein hone chahiye, code ya images mein kabhi nahi.</p></div>

<div class="scn"><h4>Woh web shell jise kabhi shell nahi mila</h4><p>Attackers ne vulnerable file-upload form ke through container mein ek PHP application par web shell upload kiya. Jab unhone commands chalane ki koshish ki, runtime security policy (eBPF-based) ne dekha ki web server process <code>/bin/sh</code> spawn kar raha hai, jo us workload ke liye policy mein forbidden hai, aur process kill kar diya. Event pod name, image digest aur parent process ke saath SIEM tak pahuncha. Team ne upload validation theek ki, upload path ke liye WAF rule joda aur image rebuild ki.</p><p><b>Seekh:</b> preventive application controls aur runtime enforcement saath kaam karte hain; doosra woh pakadta hai jo pehla chook gaya.</p></div>

<div class="iv"><p class="q">"eBPF kya hai aur security vendors iske baare mein itne excited kyun hain?"</p><p>eBPF verified, sandboxed programs ko Linux kernel ke andar network driver, sockets, system calls aur LSM jaise hook points par chalane deta hai, bina kernel modules ke. Isse deep visibility milti hai (kis process ne kaunsa connection khola) aur fast enforcement (XDP par drop, syscall block) kam overhead ke saath. Examples ke roop mein Isovalent ke Cilium aur Tetragon aur Cisco Hypershield ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers: hardened golden images, patching, vault mein secrets, WAF/API security/RASP, runtime protection.</li>
<li>Immutable infrastructure instances ko haath se patch karne ki jagah replace karta hai.</li>
<li>eBPF kernel mein packet, socket, syscall aur LSM hooks par verified programs chalata hai.</li>
<li>Cilium aur Tetragon (Isovalent) aur Cisco Hypershield eBPF-based hain.</li>
<li>WAF app ke aage, RASP uske andar, EDR/CWPP host par.</li>
</ul></div>
`}};export{e as default};