var e={id:`cleanup`,h:{en:`Clean-up discipline: try/finally, the undo stack, tags and an audit`,hi:`Clean-up ka discipline: try/finally, undo stack, tags aur audit`},body:{en:`
<p>A lab network that is never torn down is a bill that keeps growing and a security hole nobody remembers. In the cloud the meter runs while a resource exists, whether or not anyone uses it. This chapter finishes Lab 1: you break a run on purpose, watch the clean-up still happen, and prove with an audit that the account is empty.</p>

<h3>An analogy: handing back a rented flat</h3>
<p>When you leave a flat you do not just walk out. You switch things off in a sensible order, take your things, hand back the keys and get a receipt that says the flat is empty. A build script should do the same, and it should do it even if you had to leave in a hurry halfway through unpacking.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build pushes undo actions, teardown pops them in reverse">
<text x="20" y="22" class="svg-ink" font-size="13">build: each create pushes an undo action</text>
<rect x="20" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="63" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 vpc</text>
<rect x="112" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="155" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 subnets</text>
<rect x="204" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="247" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 gateway</text>
<rect x="296" y="34" width="86" height="34" rx="6" fill="#fecaca"/><text x="339" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 sg fails</text>
<text x="20" y="104" class="svg-ink" font-size="13">finally: teardown pops the newest first</text>
<rect x="20" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="63" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 3</text>
<rect x="112" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="155" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 2</text>
<rect x="204" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="247" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 1</text>
<text x="420" y="56" class="svg-muted" font-size="12">a failed stage still leaves</text><text x="420" y="72" class="svg-muted" font-size="12">its earlier undo actions</text>
<text x="420" y="138" class="svg-muted" font-size="12">reverse of creation = safe order</text>
</svg></div>
<p class="cap">The undo list is a stack: last created, first removed.</p>

<h3>The five rules</h3>
<ol>
<li><b>Tag everything</b> with a Project tag at creation, so a later audit can find it.</li>
<li><b>Record the undo action right after the create succeeds</b>, before any wait or follow-up call that could fail.</li>
<li><b>Wrap the build in try/finally.</b> The finally block runs on success, on an exception and on <code>sys.exit</code> inside the block.</li>
<li><b>Undo in reverse order</b> and never stop at the first failure: count failures, report them, keep going.</li>
<li><b>Audit afterwards</b> and make the audit's exit code say whether the account is clean.</li>
</ol>

<h3>Lab 1, task 5: break it on purpose</h3>
<p>The run below stops itself after the gateway stage, as if the security group stage had crashed. <code>run.py</code> catches the error, but only <b>after</b> the finally block has torn the network down:</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway sg --fail-after gateway; echo "exit code: $?"
build vpc
build subnets
build gateway
tear down 8 actions
  undo disassociate_route_table   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok
<span class="hl">run failed: simulated failure after gateway</span>
exit code: <span class="hl">2</span></pre>
<p>Three things to read. The sg stage never ran, so its undo is not on the list: eight actions, not nine. The tear-down line comes <b>before</b> the failure message, which proves the order. And the exit code is 2: the build failed, but the clean-up succeeded. A caller can tell "failed and clean" (2) from "clean-up failed" (1).</p>

<h3>What a build without a finally leaves behind</h3>
<p>Here is the same idea written badly. It builds three stages and crashes. There is no try, no finally:</p>
<pre class="code">"""bad.py - a build script with no clean-up: the first error leaves everything behind"""
import boto3

import vpckit

ec2 = boto3.client("ec2")
ids, undo = {}, []
vpckit.STAGES["vpc"](ec2, ids, undo)
vpckit.STAGES["subnets"](ec2, ids, undo)
vpckit.STAGES["sg"](ec2, ids, undo)
raise RuntimeError("typo in the route stage")</pre>
<pre class="out">AUTO01$ python3 bad.py; echo "exit code: $?"
Traceback (most recent call last):
  File "bad.py", line 11, in &lt;module&gt;
    raise RuntimeError("typo in the route stage")
RuntimeError: typo in the route stage
exit code: 1

AUTO01$ python3 audit.py; echo "exit code: $?"
leftovers: <span class="hl">1 vpcs, 2 subnets, 1 security groups, 0 internet gateways</span>
exit code: <span class="hl">1</span></pre>
<p>The audit finds it because everything was tagged. Now a small sweeper deletes by tag, children first, using the resource API:</p>
<pre class="code">"""sweep.py - delete everything tagged Project=adv-boto3, children first"""
import boto3

FILTER = [{"Name": "tag:Project", "Values": ["adv-boto3"]}]
res = boto3.resource("ec2")
for vpc in res.vpcs.filter(Filters=FILTER):
    for group in vpc.security_groups.all():
        if group.group_name != "default":
            print("delete security group", group.group_name)
            group.delete()
    for subnet in vpc.subnets.all():
        print("delete subnet", subnet.cidr_block)
        subnet.delete()
    print("delete vpc", vpc.id)
    vpc.delete()</pre>
<pre class="out">AUTO01$ python3 sweep.py
delete security group nk-web-sg
delete subnet 10.50.1.0/24
delete subnet 10.50.2.0/24
delete vpc vpc-a564bb07514b788de

AUTO01$ python3 audit.py
leftovers: <span class="hl">0 vpcs, 0 subnets, 0 security groups, 0 internet gateways</span></pre>
<p>This sweeper only knows about the objects of this build. A real one must also handle gateways, route tables, NAT gateways and addresses. That is why the undo stack is better than the sweeper: it knows exactly what <i>this</i> run created. Keep the sweeper as the safety net for the cases where the process was killed and no <code>finally</code> could run.</p>

<h3>Lab 1, tasks 6 and 7: prove it</h3>
<p>Run <code>audit.py</code> after the drill: it must print zero leftovers and exit 0. Then cross-check with a different tool that reads the same account. <code>aws ec2 describe-vpcs --query 'length(Vpcs)'</code> should print <code>0</code>. Two independent views agreeing is the proof; a script checking itself is not.</p>

<h3>What costs money when forgotten</h3>
<ul>
<li><b>Elastic IPs</b> that are allocated but not attached. Lab 2 hits this one.</li>
<li><b>NAT gateways</b>: billed by the hour and by the gigabyte.</li>
<li><b>Instances, volumes and snapshots</b> from an earlier test.</li>
<li><b>VPC endpoints, peering and transit gateway attachments</b> left from a design experiment.</li>
</ul>
<p>An empty VPC with subnets is almost free, but it still counts against the account limit of VPCs per region (five by default), and a script that cannot create the sixth fails with <code>VpcLimitExceeded</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Putting the undo bookkeeping at the end of the stage "when it all worked". If the second call of a stage fails, the first call's resource is orphaned. Append each undo immediately after its own create.</p></div>

<div class="exam"><p><b>Exam trap.</b> A <code>finally</code> block does not run if the process is killed (SIGKILL, power loss, a CI job cancelled hard). It protects you from exceptions, not from the machine disappearing. Tags and an audit or sweeper are the second line of defence.</p></div>

<div class="scn"><h4>The 2 a.m. cancel</h4><p>A pipeline built a test network, ran checks, and tore it down in a <code>finally</code>. One night an engineer cancelled the pipeline with a hard kill while the build was half done. The next morning the audit job reported a VPC, two subnets and an Elastic IP tagged with the pipeline's Project. A nightly sweeper deleted them, and the report was empty the following day.</p><p><b>Lesson:</b> finally for normal failures, tags plus a sweeper for abnormal ones.</p></div>

<div class="iv"><p class="q">"How do you make sure a boto3 build does not leave resources behind?"</p><p>I tag every resource with a project tag, record an undo action immediately after each successful create, and run the build inside try/finally so the undo list runs newest first even on failure. The tear-down counts failures instead of stopping. Afterwards an audit by tag, with a non-zero exit code if anything is left, confirms the account is clean. A scheduled sweep covers killed processes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The meter runs while a resource exists; a build without a tear-down is a recurring bill.</li>
<li>Undo stack plus try/finally gives reverse-order clean-up for free.</li>
<li>Tear-down must not stop at the first failure; report and continue.</li>
<li>Prove it with an audit by tag and a second view, the CLI.</li>
<li><code>finally</code> cannot survive a hard kill; keep a sweeper as the safety net.</li>
</ul></div>
`,hi:`
<p>Jo lab network kabhi tear down nahi hota woh badhta hua bill aur ek aisa security hole hai jo kisi ko yaad nahi. Cloud mein meter tab tak chalta hai jab tak resource exist karta hai, chahe koi use kare ya na kare. Yeh chapter Lab 1 ko poora karta hai: aap ek run jaanbujhkar todte ho, dekhte ho clean-up phir bhi hota hai, aur audit se saabit karte ho ki account khali hai.</p>

<h3>Analogy: kiraye ka flat wapas karna</h3>
<p>Flat chhodte waqt aap bas nikal nahi jaate. Cheezein samajhdaari ke order mein band karte ho, apna saaman lete ho, chaabi wapas karte ho aur receipt lete ho ki flat khali hai. Build script ko bhi aisa hi karna chahiye, aur tab bhi jab aapko saaman kholte-kholte beech mein jaldi nikalna pade.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build pushes undo actions, teardown pops them in reverse">
<text x="20" y="22" class="svg-ink" font-size="13">build: har create ek undo action push karta hai</text>
<rect x="20" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="63" y="56" text-anchor="middle" class="svg-ink" font-size="12">1 vpc</text>
<rect x="112" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="155" y="56" text-anchor="middle" class="svg-ink" font-size="12">2 subnets</text>
<rect x="204" y="34" width="86" height="34" rx="6" fill="#bae6fd"/><text x="247" y="56" text-anchor="middle" class="svg-ink" font-size="12">3 gateway</text>
<rect x="296" y="34" width="86" height="34" rx="6" fill="#fecaca"/><text x="339" y="56" text-anchor="middle" class="svg-ink" font-size="12">4 sg fail</text>
<text x="20" y="104" class="svg-ink" font-size="13">finally: teardown sabse naya pehle pop karta hai</text>
<rect x="20" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="63" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 3</text>
<rect x="112" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="155" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 2</text>
<rect x="204" y="116" width="86" height="34" rx="6" fill="#bbf7d0"/><text x="247" y="138" text-anchor="middle" class="svg-ink" font-size="12">undo 1</text>
<text x="420" y="56" class="svg-muted" font-size="12">fail hua stage bhi apne</text><text x="420" y="72" class="svg-muted" font-size="12">pehle ke undo chhodta hai</text>
<text x="420" y="138" class="svg-muted" font-size="12">creation ka ulta = safe order</text>
</svg></div>
<p class="cap">Undo list ek stack hai: jo aakhir mein bana, woh sabse pehle hata.</p>

<h3>Paanch rules</h3>
<ol>
<li><b>Sab kuch tag karo</b>, creation par Project tag ke saath, taaki baad ka audit use dhoondh sake.</li>
<li><b>Undo action create safal hote hi record karo</b>, kisi bhi wait ya follow-up call se pehle jo fail ho sakti hai.</li>
<li><b>Build ko try/finally mein wrap karo.</b> Finally block success par, exception par aur block ke andar <code>sys.exit</code> par chalta hai.</li>
<li><b>Ulte order mein undo karo</b> aur pehle failure par kabhi mat ruko: failures gino, report karo, chalte raho.</li>
<li><b>Baad mein audit karo</b> aur audit ka exit code batane do ki account clean hai ya nahi.</li>
</ol>

<h3>Lab 1, task 5: jaanbujhkar todo</h3>
<p>Neeche ka run gateway stage ke baad khud ko rok leta hai, jaise security group stage crash ho gaya ho. <code>run.py</code> error pakadti hai, par finally block network ko tear down kar dene ke <b>baad</b>:</p>
<pre class="out">AUTO01$ python3 run.py vpc subnets gateway sg --fail-after gateway; echo "exit code: $?"
build vpc
build subnets
build gateway
tear down 8 actions
  undo disassociate_route_table   ok
  undo delete_route               ok
  undo delete_route_table         ok
  undo detach_internet_gateway    ok
  undo delete_internet_gateway    ok
  undo delete_subnet              ok
  undo delete_subnet              ok
  undo delete_vpc                 ok
<span class="hl">run failed: simulated failure after gateway</span>
exit code: <span class="hl">2</span></pre>
<p>Teen cheezein padho. sg stage kabhi chala hi nahi, isliye uska undo list mein nahi: nau nahi, aath actions. Tear-down wali line failure message se <b>pehle</b> aati hai, jo order saabit karta hai. Aur exit code 2 hai: build fail hua, par clean-up safal. Caller "fail aur clean" (2) ko "clean-up fail" (1) se alag pehchan sakta hai.</p>

<h3>Finally ke bina build kya chhodta hai</h3>
<p>Wahi idea ab kharab tareeqe se. Yeh teen stages build karti hai aur crash hoti hai. Na try hai, na finally:</p>
<pre class="code">"""bad.py - a build script with no clean-up: the first error leaves everything behind"""
import boto3

import vpckit

ec2 = boto3.client("ec2")
ids, undo = {}, []
vpckit.STAGES["vpc"](ec2, ids, undo)
vpckit.STAGES["subnets"](ec2, ids, undo)
vpckit.STAGES["sg"](ec2, ids, undo)
raise RuntimeError("typo in the route stage")</pre>
<pre class="out">AUTO01$ python3 bad.py; echo "exit code: $?"
Traceback (most recent call last):
  File "bad.py", line 11, in &lt;module&gt;
    raise RuntimeError("typo in the route stage")
RuntimeError: typo in the route stage
exit code: 1

AUTO01$ python3 audit.py; echo "exit code: $?"
leftovers: <span class="hl">1 vpcs, 2 subnets, 1 security groups, 0 internet gateways</span>
exit code: <span class="hl">1</span></pre>
<p>Audit use isliye dhoondh leta hai kyunki sab kuch tag tha. Ab ek chhota sweeper tag ke hisaab se, children pehle, resource API se delete karta hai:</p>
<pre class="code">"""sweep.py - delete everything tagged Project=adv-boto3, children first"""
import boto3

FILTER = [{"Name": "tag:Project", "Values": ["adv-boto3"]}]
res = boto3.resource("ec2")
for vpc in res.vpcs.filter(Filters=FILTER):
    for group in vpc.security_groups.all():
        if group.group_name != "default":
            print("delete security group", group.group_name)
            group.delete()
    for subnet in vpc.subnets.all():
        print("delete subnet", subnet.cidr_block)
        subnet.delete()
    print("delete vpc", vpc.id)
    vpc.delete()</pre>
<pre class="out">AUTO01$ python3 sweep.py
delete security group nk-web-sg
delete subnet 10.50.1.0/24
delete subnet 10.50.2.0/24
delete vpc vpc-a564bb07514b788de

AUTO01$ python3 audit.py
leftovers: <span class="hl">0 vpcs, 0 subnets, 0 security groups, 0 internet gateways</span></pre>
<p>Yeh sweeper sirf is build ke objects jaanta hai. Asli sweeper ko gateways, route tables, NAT gateways aur addresses bhi sambhalne honge. Isliye undo stack sweeper se behtar hai: woh theek wahi jaanta hai jo <i>is</i> run ne banaya. Sweeper ko safety net ke roop mein rakho un cases ke liye jahan process kill ho gaya aur koi <code>finally</code> chal nahi saka.</p>

<h3>Lab 1, tasks 6 aur 7: saabit karo</h3>
<p>Drill ke baad <code>audit.py</code> chalao: woh zero leftovers print kare aur exit 0 de. Phir ek alag tool se cross-check karo jo wahi account padhta hai. <code>aws ec2 describe-vpcs --query 'length(Vpcs)'</code> <code>0</code> print kare. Do independent views ka sahmat hona saboot hai; script ka khud ko check karna nahi.</p>

<h3>Bhoolne par paisa kya khata hai</h3>
<ul>
<li><b>Elastic IPs</b> jo allocate hain par attach nahi. Lab 2 isi se takrata hai.</li>
<li><b>NAT gateways</b>: ghante aur gigabyte ke hisaab se bill.</li>
<li><b>Instances, volumes aur snapshots</b> pichle test se.</li>
<li><b>VPC endpoints, peering aur transit gateway attachments</b> jo design experiment se bache.</li>
</ul>
<p>Subnets wala khali VPC lagbhag free hai, par woh phir bhi region ke VPC limit (default paanch) mein ginta hai, aur jo script chhatha nahi bana sakti woh <code>VpcLimitExceeded</code> se fail hoti hai.</p>

<div class="warn"><p><b>Common mistake.</b> Undo bookkeeping ko stage ke ant mein "jab sab chal jaye" tab rakhna. Stage ki doosri call fail ho to pehli call ka resource orphan ho jata hai. Har undo ko uski apni create ke turant baad append karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Process kill ho jaye (SIGKILL, bijli gayi, CI job zabardasti cancel) to <code>finally</code> block nahi chalta. Yeh exceptions se bachata hai, machine ke gaayab hone se nahi. Tags aur audit ya sweeper doosri raksha-line hain.</p></div>

<div class="scn"><h4>Raat 2 baje ka cancel</h4><p>Ek pipeline ne test network banaya, checks chalaye, aur <code>finally</code> mein tear down kiya. Ek raat engineer ne build adhura tha tab pipeline ko hard kill se cancel kar diya. Agli subah audit job ne pipeline ke Project tag wala ek VPC, do subnets aur ek Elastic IP report kiya. Nightly sweeper ne unhe delete kar diya, aur agle din report khali thi.</p><p><b>Lesson:</b> normal failures ke liye finally, abnormal ke liye tags aur sweeper.</p></div>

<div class="iv"><p class="q">"Kaise sunishchit karte ho ki boto3 build resources peeche na chhode?"</p><p>Har resource par project tag lagata hoon, har safal create ke turant baad undo action record karta hoon, aur build ko try/finally mein chalata hoon taaki undo list failure par bhi newest pehle chale. Tear-down rukta nahi, failures ginta hai. Baad mein tag se audit, jo kuch bacha ho to non-zero exit code deta hai, confirm karta hai ki account clean hai. Scheduled sweep killed processes ko cover karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Meter tab tak chalta hai jab tak resource hai; tear-down ke bina build ek baar-baar aane wala bill hai.</li>
<li>Undo stack aur try/finally reverse-order clean-up free dete hain.</li>
<li>Tear-down pehle failure par nahi rukta; report karo aur chalo.</li>
<li>Tag se audit aur doosra view, CLI, se saabit karo.</li>
<li><code>finally</code> hard kill nahi jhel sakta; safety net ke liye sweeper rakho.</li>
</ul></div>
`}};export{e as default};