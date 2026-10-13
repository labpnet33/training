var e={id:`storage-network`,h:{en:`Storage exposure and security groups`,hi:`Storage exposure aur security groups`},body:{en:`
<p>A storage bucket is like a locker in a railway station. You can keep the locker shut and give the key only to your family, or you can leave the door wide open with a sign saying "help yourself". A security group is like the guard at your apartment door who has a written list: "let in the pizza delivery on port 443 from anyone, let in the electrician on port 22 only if he comes from the society office". Lab 1 is about a locker left open and a guard whose list says "electrician from anywhere".</p>

<h3>Object storage in one minute</h3>
<p>Object storage (buckets) holds files called <b>objects</b>, addressed by a bucket name and a key, reachable over HTTPS from anywhere. Access is controlled by several layers that combine:</p>
<ul>
<li><b>ACLs</b>: old-style grants such as <code>private</code> or <code>public-read</code>.</li>
<li><b>Bucket policies</b>: JSON policies on the bucket itself, which can grant access to "*" (everyone).</li>
<li><b>Block Public Access</b>: an override switch at bucket or account level that ignores any public ACL or policy. Turn it on everywhere except for buckets that are public by design.</li>
<li><b>Encryption at rest</b>: provider-managed keys (default, transparent) or <b>customer-managed keys</b> in a KMS, where you control who may use the key and can revoke it.</li>
<li><b>Pre-signed URLs</b>: time-limited links for sharing one object, instead of making the bucket public.</li>
</ul>

<h3>Security groups and network ACLs</h3>
<table class="cmp"><tr><th>Feature</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Attached to</td><td>An instance or network interface</td><td>A subnet</td></tr>
<tr><td>State</td><td><b>Stateful</b>: return traffic is allowed automatically</td><td><b>Stateless</b>: return traffic needs its own rule</td></tr>
<tr><td>Rules</td><td>Allow only; everything else is dropped</td><td>Allow and deny, evaluated in number order</td></tr>
<tr><td>Typical use</td><td>Per-workload micro-perimeter</td><td>Coarse subnet guardrail</td></tr>
</table>
<p>When a security group drops a packet it does so silently: no TCP reset, no ICMP. A scanner therefore reports the port as <b>filtered</b>, not <b>closed</b>. "Closed" means the host itself answered with a reset because nothing listens on the port.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 exposure">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="92" text-anchor="middle" class="svg-ink" font-size="13">EXT-PC</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.90.0.50</text>
<rect x="250" y="20" width="160" height="60" rx="8" fill="#fed7aa"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">nk-payroll-exports</text><text x="330" y="65" text-anchor="middle" class="svg-muted" font-size="12">ACL public-read</text>
<rect x="250" y="115" width="160" height="60" rx="8" fill="#bae6fd"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="12">sg-web</text><text x="330" y="160" text-anchor="middle" class="svg-muted" font-size="12">22 and 443 from 0.0.0.0/0</text>
<rect x="490" y="115" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="12">web-01</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">52.66.10.20</text>
<line x1="130" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: the outside laptop can read the payroll bucket and reach SSH on web-01.</p></div>

<h3>Confirming the exposure from outside (Lab 1, task 1)</h3>
<p>Always prove an external report from an external vantage point. From EXT-PC:</p>
<pre class="code">EXT-PC&gt; curl nk-payroll-exports.storage.example/payroll-2026-09.csv
EXT-PC&gt; nmap -p 22,443 52.66.10.20</pre>
<pre class="out"><span class="hl">employee_id,name,pan,aadhaar,corporate_card</span>
E1021,Asha Verma,... (rows of sensitive employee data)

PORT     STATE    SERVICE
<span class="hl">22/tcp   open     ssh</span>
443/tcp  open     h&#116;tps</pre>
<p>The CSV header alone tells you the severity: PAN, Aadhaar and card numbers make this a reportable personal-data breach under India's DPDP Act and a PCI DSS problem.</p>

<h3>The fix in the CLOUD console (tasks 2 and 3)</h3>
<pre class="code"><span class="c">! CLOUD &gt; Storage &gt; nk-payroll-exports</span>
ACL                  : private
Block public access  : On
Encryption           : KMS (customer-managed)
<span class="c">! Do NOT touch nk-web-assets: public by design, RISK-104 accepted</span>

<span class="c">! CLOUD &gt; Security Groups &gt; sg-web &gt; rule tcp/22 &gt; edit Source</span>
tcp 443  0.0.0.0/0      HTTPS from anywhere   (keep)
tcp 22   10.99.0.0/24   admin VPN only        (was 0.0.0.0/0)</pre>
<p>Edit the source of the SSH rule rather than deleting it, so administrators can still reach web-01 through the admin VPN. CSP-101 and CSP-103 close after the bucket change, CSP-102 after the rule change.</p>

<h3>Verifying from outside again (task 5)</h3>
<pre class="out">&lt;Error&gt;&lt;Code&gt;<span class="hl">AccessDenied</span>&lt;/Code&gt;&lt;Message&gt;Access Denied&lt;/Message&gt;&lt;BucketName&gt;nk-payroll-exports&lt;/BucketName&gt;&lt;/Error&gt;

PORT     STATE    SERVICE
<span class="hl">22/tcp   filtered ssh</span>
443/tcp  open     h&#116;tps</pre>

<div class="eg"><p><b>Worked example: why the encryption change matters.</b> Changing provider-managed encryption to a customer-managed KMS key does not stop a public read; Block Public Access does that. What KMS adds is a second lock: an identity now needs both <code>s3:GetObject</code> on the bucket and permission to use key <code>alias/nk-data</code>. If a role is over-privileged on storage but has no key permission, the data stays unreadable.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making every bucket private in a hurry and breaking the public website bucket that was accepted as public. Deleting the SSH rule and locking administrators out. Testing from inside the VPC, where the security group may allow you, and declaring victory.</p></div>
<div class="exam"><p><b>Exam traps.</b> Security groups are stateful and allow-only; network ACLs are stateless with ordered allow and deny rules. A port dropped by a security group shows as filtered. Encryption at rest does not fix public exposure.</p></div>

<div class="scn"><h4>The "temp admin access" rule</h4><p>During a late-night outage an engineer added SSH from 0.0.0.0/0 to a web server's security group, with the description "temp admin access". The outage ended; the rule stayed. Three months later the auth log showed thousands of password-guessing attempts a day from all over the world. Nobody had got in because password authentication was disabled and keys were required, but the CSPM finding had been ignored as noise. The team changed the source to the admin VPN range, added a guardrail rejecting 0.0.0.0/0 on port 22, and moved break-glass access to a session manager with no inbound port at all.</p><p><b>Lesson:</b> "temporary" rules are permanent unless something removes them. Let posture tooling and guardrails do that.</p></div>

<div class="iv"><p class="q">"A researcher says your bucket is public. Walk me through your first 30 minutes."</p><p>Confirm from outside (curl the object), then contain: Block Public Access on and the ACL private, without breaking buckets that are public by design. Preserve evidence: pull the audit log for who changed the ACL and when, and the access logs for who downloaded what. Revoke the identity that made the change if it is suspicious. Then fix the root cause in IaC and add a guardrail. Finally, involve legal and privacy because personal data was exposed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bucket access combines ACLs, bucket policies and Block Public Access; turn the block on by default.</li>
<li>Customer-managed KMS keys add a second lock but do not fix public exposure.</li>
<li>Security groups are stateful and allow-only; network ACLs are stateless and ordered.</li>
<li>A port dropped by a security group shows as filtered in nmap.</li>
<li>Always verify from an outside vantage point, before and after the fix.</li>
</ul></div>
`,hi:`
<p>Storage bucket railway station ke locker jaisa hai. Aap locker band rakh sakte ho aur chaabi sirf family ko de sakte ho, ya darwaza poora khula chhod sakte ho ek board ke saath "jo chahiye le lo". Security group aapke apartment ke darwaze par khade guard jaisa hai jiske paas likhi hui list hai: "pizza delivery ko port 443 par kisi se bhi aane do, electrician ko port 22 par sirf tab aane do jab woh society office se aaye". Lab 1 ek khule chhode locker aur aise guard ke baare mein hai jiski list kehti hai "electrician kahin se bhi".</p>

<h3>Ek minute mein object storage</h3>
<p>Object storage (buckets) files rakhta hai jinhe <b>objects</b> kehte hain, bucket name aur key se address hote hain, aur kahin se bhi HTTPS par reachable hote hain. Access kai layers se control hota hai jo milkar kaam karti hain:</p>
<ul>
<li><b>ACLs</b>: purane style ke grants jaise <code>private</code> ya <code>public-read</code>.</li>
<li><b>Bucket policies</b>: bucket par hi JSON policies, jo "*" (sabko) access de sakti hain.</li>
<li><b>Block Public Access</b>: bucket ya account level par override switch jo kisi bhi public ACL ya policy ko ignore karta hai. Ise har jagah on karo, sirf un buckets ko chhod kar jo design se public hain.</li>
<li><b>Encryption at rest</b>: provider-managed keys (default, transparent) ya KMS mein <b>customer-managed keys</b>, jahan aap control karte ho ki key kaun use kar sakta hai aur use revoke kar sakte ho.</li>
<li><b>Pre-signed URLs</b>: ek object share karne ke liye time-limited links, bucket ko public karne ki jagah.</li>
</ul>

<h3>Security groups aur network ACLs</h3>
<table class="cmp"><tr><th>Feature</th><th>Security group</th><th>Network ACL</th></tr>
<tr><td>Kahan attach hota hai</td><td>Instance ya network interface par</td><td>Subnet par</td></tr>
<tr><td>State</td><td><b>Stateful</b>: return traffic apne aap allow</td><td><b>Stateless</b>: return traffic ko apna rule chahiye</td></tr>
<tr><td>Rules</td><td>Sirf allow; baaki sab drop</td><td>Allow aur deny, number order mein evaluate</td></tr>
<tr><td>Typical use</td><td>Per-workload micro-perimeter</td><td>Moti subnet guardrail</td></tr>
</table>
<p>Jab security group packet drop karta hai to chupchaap karta hai: na TCP reset, na ICMP. Isliye scanner port ko <b>filtered</b> report karta hai, <b>closed</b> nahi. "Closed" ka matlab hai host ne khud reset se jawab diya kyunki port par kuch listen nahi kar raha.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 exposure">
<rect x="10" y="70" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="92" text-anchor="middle" class="svg-ink" font-size="13">EXT-PC</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="12">10.90.0.50</text>
<rect x="250" y="20" width="160" height="60" rx="8" fill="#fed7aa"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">nk-payroll-exports</text><text x="330" y="65" text-anchor="middle" class="svg-muted" font-size="12">ACL public-read</text>
<rect x="250" y="115" width="160" height="60" rx="8" fill="#bae6fd"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="12">sg-web</text><text x="330" y="160" text-anchor="middle" class="svg-muted" font-size="12">22 aur 443, 0.0.0.0/0 se</text>
<rect x="490" y="115" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="140" text-anchor="middle" class="svg-ink" font-size="12">web-01</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">52.66.10.20</text>
<line x1="130" y1="90" x2="250" y2="50" stroke="#64748b" stroke-width="2"/><line x1="130" y1="100" x2="250" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: bahar ka laptop payroll bucket padh sakta hai aur web-01 par SSH tak pahunch sakta hai.</p></div>

<h3>Bahar se exposure confirm karna (Lab 1, task 1)</h3>
<p>External report ko hamesha external vantage point se prove karo. EXT-PC se:</p>
<pre class="code">EXT-PC&gt; curl nk-payroll-exports.storage.example/payroll-2026-09.csv
EXT-PC&gt; nmap -p 22,443 52.66.10.20</pre>
<pre class="out"><span class="hl">employee_id,name,pan,aadhaar,corporate_card</span>
E1021,Asha Verma,... (sensitive employee data ki rows)

PORT     STATE    SERVICE
<span class="hl">22/tcp   open     ssh</span>
443/tcp  open     h&#116;tps</pre>
<p>Sirf CSV header se severity pata chal jaati hai: PAN, Aadhaar aur card numbers ise India ke DPDP Act ke under reportable personal-data breach aur PCI DSS problem banate hain.</p>

<h3>CLOUD console mein fix (tasks 2 aur 3)</h3>
<pre class="code"><span class="c">! CLOUD &gt; Storage &gt; nk-payroll-exports</span>
ACL                  : private
Block public access  : On
Encryption           : KMS (customer-managed)
<span class="c">! nk-web-assets ko mat chhuo: design se public, RISK-104 accepted</span>

<span class="c">! CLOUD &gt; Security Groups &gt; sg-web &gt; rule tcp/22 &gt; Source edit karo</span>
tcp 443  0.0.0.0/0      HTTPS from anywhere   (rakho)
tcp 22   10.99.0.0/24   admin VPN only        (pehle 0.0.0.0/0)</pre>
<p>SSH rule delete karne ki jagah uska source edit karo, taaki administrators admin VPN se web-01 tak pahunch sakein. Bucket change ke baad CSP-101 aur CSP-103 band hote hain, rule change ke baad CSP-102.</p>

<h3>Bahar se dobara verify karna (task 5)</h3>
<pre class="out">&lt;Error&gt;&lt;Code&gt;<span class="hl">AccessDenied</span>&lt;/Code&gt;&lt;Message&gt;Access Denied&lt;/Message&gt;&lt;BucketName&gt;nk-payroll-exports&lt;/BucketName&gt;&lt;/Error&gt;

PORT     STATE    SERVICE
<span class="hl">22/tcp   filtered ssh</span>
443/tcp  open     h&#116;tps</pre>

<div class="eg"><p><b>Worked example: encryption change kyun matter karta hai.</b> Provider-managed encryption ko customer-managed KMS key mein badalne se public read nahi rukta; woh Block Public Access karta hai. KMS ek doosra taala jodta hai: ab identity ko bucket par <code>s3:GetObject</code> aur key <code>alias/nk-data</code> use karne ki permission dono chahiye. Agar kisi role ke paas storage par zyada privilege hai lekin key permission nahi, to data unreadable rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Jaldi mein har bucket private kar dena aur public website bucket tod dena jo public ke roop mein accepted tha. SSH rule delete karke administrators ko lock out kar dena. VPC ke andar se test karna, jahan security group aapko allow kar sakta hai, aur jeet declare kar dena.</p></div>
<div class="exam"><p><b>Exam traps.</b> Security groups stateful aur allow-only hain; network ACLs stateless hain jinmein ordered allow aur deny rules hote hain. Security group se drop hua port filtered dikhta hai. Encryption at rest public exposure theek nahi karta.</p></div>

<div class="scn"><h4>"Temp admin access" rule</h4><p>Raat ke ek outage ke dauraan ek engineer ne web server ke security group mein 0.0.0.0/0 se SSH jod diya, description "temp admin access" ke saath. Outage khatam hua; rule reh gaya. Teen mahine baad auth log mein duniya bhar se roz hazaaron password-guessing attempts dikhe. Koi andar nahi aa paaya kyunki password authentication disabled tha aur keys zaroori thi, lekin CSPM finding ko noise samajh kar ignore kiya gaya tha. Team ne source admin VPN range kar diya, port 22 par 0.0.0.0/0 reject karne wala guardrail lagaya, aur break-glass access ko session manager par le gayi jismein koi inbound port hi nahi.</p><p><b>Seekh:</b> "temporary" rules tab tak permanent hain jab tak koi unhe hataye nahi. Yeh kaam posture tooling aur guardrails ko karne do.</p></div>

<div class="iv"><p class="q">"Ek researcher kehta hai aapka bucket public hai. Apne pehle 30 minute samjhao."</p><p>Bahar se confirm karo (object curl karo), phir contain karo: Block Public Access on aur ACL private, un buckets ko tode bina jo design se public hain. Evidence preserve karo: kisne kab ACL badla iske liye audit log, aur kisne kya download kiya iske liye access logs nikaalo. Agar change karne wali identity suspicious hai to use revoke karo. Phir IaC mein root cause theek karo aur guardrail jodo. Aakhir mein legal aur privacy ko involve karo kyunki personal data expose hua.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bucket access ACLs, bucket policies aur Block Public Access ko jodta hai; block default mein on rakho.</li>
<li>Customer-managed KMS keys doosra taala jodti hain lekin public exposure theek nahi karti.</li>
<li>Security groups stateful aur allow-only hain; network ACLs stateless aur ordered hain.</li>
<li>Security group se drop hua port nmap mein filtered dikhta hai.</li>
<li>Fix se pehle aur baad, hamesha bahar ke vantage point se verify karo.</li>
</ul></div>
`}};export{e as default};