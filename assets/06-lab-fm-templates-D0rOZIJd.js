var e={id:`lab-fm-templates`,h:{en:`Lab fm-templates: provision the Trichy branch`,hi:`Lab fm-templates: Trichy branch ko provision karo`},body:{en:`
<p>A good builder follows the sequence foundation, walls, roof, and checks each stage before starting the next. This lab asks you to provision a branch with the same discipline. You create three templates, assign them to TRY-FGT, and install. After each stage you read the status and decide what it tells you. The lab is a configuration lab of about 30 minutes, and the lesson is in the order, not in the typing.</p>

<h3>The goal</h3>
<p>Kaveri Retail wants Trichy to use the company DNS servers and the search domain kaveri.example, to know the management network 192.0.2.0/24 as an address object, and to carry the standard branch tunnel to the hub. You define a system template KR-DNS, a CLI template KR-MGMT-ADDR and an IPsec template KR-Branch-IPsec in the ADOM Kaveri, assign all three to TRY-FGT, preview and install. The final state to reach: DNS 192.0.2.53 on TRY-FGT, the address NK-MGMT, the phase 1 interface TO-HQ with remote gateway 203.0.113.1, and dev-db: not modified.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab plan">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 1</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">DNS template</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 2</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">CLI template</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 3</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">IPsec copy</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 4</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">preview, install</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">on TRY-FGT</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">read diagnose dvm device list after every task</text>
</svg><p class="cap">Three templates, one install, one verification.</p></div>

<h3>Approach, task by task</h3>
<p><b>Task 1, the DNS template.</b> Create KR-DNS as a system template with both DNS servers and the domain, then assign it in the device entry of TRY-FGT. Before touching the install, read <code>diagnose dvm device list</code>. The lab asks which dev-db value you see: it is <code>modified</code>, with cond pending, because FortiManager holds a change the branch has not received. If you also run <code>show system dns</code> on TRY-FGT, the output is empty. That contrast is the point of this task.</p>
<p><b>Task 2, the CLI template.</b> One script creates the address NK-MGMT with subnet 192.0.2.0 and mask 255.255.255.0. Write it as the five CLI lines you would type on the FortiGate and join them with semicolons. Assign it with the cli-template attribute. A typical wrong turn is to assign it with <code>template</code>, which is reserved for the system template and gives an error because no system template has that name.</p>
<p><b>Task 3, the IPsec template.</b> Run the template list first so you can see the recommended names. Activate Branch_IPSec_Recommended under the new name KR-Branch-IPsec, then fill in tunnel-name TO-HQ, remote-gw 203.0.113.1 and the pre-shared key from the task text, and assign it with ipsec-template. Remember that this activate command is a simulator form of a GUI action.</p>
<pre class="out">FMG-1 # execute fmgui template list Kaveri
NAME                            TYPE            SOURCE
default                         system          Fortinet-managed (read-only)
Branch_IPSec_Recommended        ipsec           Fortinet-recommended (read-only, activate to use)
KR-Branch-IPsec                 ipsec           <span class="hl">activated from Branch_IPSec_Recommended</span></pre>
<p><b>Task 4, preview and install.</b> The preview should list the lines in the order DNS, IPsec phase 1 and phase 2, then your address script. Count the lines before you install. Then install the device settings only, because no policy package is involved. Finally verify on the FortiGate with three show commands: DNS, the address NK-MGMT, and the phase 1 interface.</p>

<h3>What the output must show</h3>
<pre class="out">FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: <span class="hl">dev-db: not modified</span>; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG

TRY-FGT # show firewall address NK-MGMT
config firewall address
    edit "NK-MGMT"
        set subnet 192.0.2.0 255.255.255.0
    next
end

TRY-FGT # show vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        <span class="hl">set remote-gw 203.0.113.1</span></pre>
<p>The revision list then holds revision 1 (retrieve) and revision 2 (install). Revision diff between 1 and 2 adds the DNS lines, the address NK-MGMT, the phase 1 interface TO-HQ and the phase 2 interface TO-HQ-P2. If you want a record for the ticket, that diff is the cleanest one.</p>

<h3>Common wrong turns</h3>
<ul>
<li>Installing before assigning all three templates, then wondering why only DNS arrived. Each install is complete for what was assigned at that moment; you may install twice, but each install creates a revision.</li>
<li>Typing the script with line breaks or commas. Only the semicolon splits lines.</li>
<li>Leaving the factory pre-shared key. The lab text gives you the correct one.</li>
<li>Staying inside an <code>edit</code> block after an error. The next <code>execute</code> line is rejected with a parse error until you type <code>end</code>.</li>
<li>Reading the key in the preview as a leak of the device. It is FortiManager's preview, which shows clear text; the FortiGate shows it encrypted.</li>
</ul>

<div class="warn"><p><b>Watch for.</b> The lab accepts the install only when the three show commands agree with the task text. If one is missing, return to that task rather than editing the FortiGate directly: a local change would make conf out of sync and is not how templates are meant to be used.</p></div>

<div class="exam"><p><b>Exam traps.</b> The lab covers the order system, IPsec, CLI, the three assignment attributes (template, ipsec-template, cli-template), the dev-db change from modified to not modified, and read-only recommended templates. Know all of them without looking.</p></div>

<div class="scn"><h4>Three templates, one forgotten assignment</h4><p>A trainee finished the lab but the check failed on the tunnel. She had created and filled in KR-Branch-IPsec, yet had assigned only the DNS and CLI templates. The preview showed only ten lines, not the expected twenty-eight, which was her clue. After set ipsec-template and a second install, the preview matched and the tunnel TO-HQ appeared on TRY-FGT.</p><p><b>Lesson:</b> the preview line count is the quickest check that every assigned template contributes its lines.</p></div>

<div class="iv"><p class="q">"Walk me through provisioning a new branch with templates."</p><p>Create or reuse the system, CLI and IPsec templates in the ADOM, assign them to the device, read the status for dev-db modified, preview the lines, install the device settings, and verify on the FortiGate and in the revision diff. Mention the order of installation and that a package is a separate step.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assign with template, cli-template and ipsec-template; they are three different attributes.</li>
<li>After assignment, dev-db is modified while the FortiGate is still unchanged.</li>
<li>Preview line count and order tell you whether every template is included.</li>
<li>Install the device settings, then verify DNS, the address and the tunnel on TRY-FGT.</li>
<li>Revision diff 1 to 2 is a clean record of what the install added.</li>
</ul></div>
`,hi:`
<p>Achha builder foundation, walls, roof ke sequence mein kaam karta hai aur agla stage shuru karne se pehle har stage check karta hai. Ye lab aapse isi discipline ke saath branch provision karwata hai. Aap teen templates banate ho, unhe TRY-FGT ko assign karte ho, aur install karte ho. Har stage ke baad status padhte ho aur tay karte ho wo kya batata hai. Lab lagbhag 30 minute ka configuration lab hai, aur seekh order mein hai, typing mein nahi.</p>

<h3>Goal</h3>
<p>Kaveri Retail chahta hai ki Trichy company DNS servers aur search domain kaveri.example use kare, management network 192.0.2.0/24 ko address object ki tarah jaane, aur hub tak standard branch tunnel rakhe. Aap ADOM Kaveri mein system template KR-DNS, CLI template KR-MGMT-ADDR aur IPsec template KR-Branch-IPsec define karte ho, teeno TRY-FGT ko assign karte ho, preview aur install karte ho. Final state: TRY-FGT par DNS 192.0.2.53, address NK-MGMT, remote gateway 203.0.113.1 wala phase 1 interface TO-HQ, aur dev-db: not modified.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab plan">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="65" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 1</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">DNS template</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 2</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">CLI template</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 3</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">IPsec copy</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="12">Task 4</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">preview, install</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="55" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">TRY-FGT par</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">har task ke baad diagnose dvm device list padho</text>
</svg><p class="cap">Teen templates, ek install, ek verification.</p></div>

<h3>Approach, task by task</h3>
<p><b>Task 1, DNS template.</b> KR-DNS ko system template ki tarah dono DNS servers aur domain ke saath banao, phir TRY-FGT ki device entry mein assign karo. Install ko haath lagane se pehle <code>diagnose dvm device list</code> padho. Lab puchta hai dev-db ki kaunsi value dikhti hai: <code>modified</code>, cond pending ke saath, kyunki FortiManager ke paas wo change hai jo branch ko nahi mila. Saath mein TRY-FGT par <code>show system dns</code> chalao to output khaali hai. Is task ka point wahi contrast hai.</p>
<p><b>Task 2, CLI template.</b> Ek script subnet 192.0.2.0 aur mask 255.255.255.0 ke saath address NK-MGMT banati hai. Use un paanch CLI lines ki tarah likho jo aap FortiGate par type karte aur semicolons se jodo. cli-template attribute se assign karo. Aam galti hai use <code>template</code> se assign karna, jo system template ke liye reserved hai aur error deta hai kyunki us naam ka koi system template nahi hai.</p>
<p><b>Task 3, IPsec template.</b> Pehle template list chalao taaki recommended names dikhein. Branch_IPSec_Recommended ko naye naam KR-Branch-IPsec se activate karo, phir tunnel-name TO-HQ, remote-gw 203.0.113.1 aur task text wali pre-shared key bharo, aur ipsec-template se assign karo. Yaad rakho ki ye activate command GUI action ka simulator form hai.</p>
<pre class="out">FMG-1 # execute fmgui template list Kaveri
NAME                            TYPE            SOURCE
default                         system          Fortinet-managed (read-only)
Branch_IPSec_Recommended        ipsec           Fortinet-recommended (read-only, activate to use)
KR-Branch-IPsec                 ipsec           <span class="hl">activated from Branch_IPSec_Recommended</span></pre>
<p><b>Task 4, preview aur install.</b> Preview mein lines is order mein honi chahiye: DNS, IPsec phase 1 aur phase 2, phir aapki address script. Install se pehle lines ginti karo. Phir sirf device settings install karo, kyunki koi policy package involved nahi hai. Aakhir mein FortiGate par teen show commands se verify karo: DNS, address NK-MGMT, aur phase 1 interface.</p>

<h3>Output kya dikhana chahiye</h3>
<pre class="out">FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: <span class="hl">dev-db: not modified</span>; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG

TRY-FGT # show firewall address NK-MGMT
config firewall address
    edit "NK-MGMT"
        set subnet 192.0.2.0 255.255.255.0
    next
end

TRY-FGT # show vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        <span class="hl">set remote-gw 203.0.113.1</span></pre>
<p>Revision list mein phir revision 1 (retrieve) aur revision 2 (install) hote hain. 1 aur 2 ke beech revision diff DNS lines, address NK-MGMT, phase 1 interface TO-HQ aur phase 2 interface TO-HQ-P2 jodta hai. Ticket ke liye record chahiye to wahi diff sabse saaf hai.</p>

<h3>Common wrong turns</h3>
<ul>
<li>Teeno templates assign karne se pehle install karna, aur phir sochna ki sirf DNS kyun pahuncha. Har install us waqt jo assigned tha uske liye complete hota hai; do baar install kar sakte ho, par har install ek revision banata hai.</li>
<li>Script line breaks ya commas ke saath type karna. Sirf semicolon lines ko split karta hai.</li>
<li>Factory pre-shared key chhod dena. Lab text sahi key deta hai.</li>
<li>Error ke baad <code>edit</code> block ke andar rehna. Agli <code>execute</code> line parse error se reject hoti hai jab tak <code>end</code> type na karo.</li>
<li>Preview mein key dikhna device ka leak samajhna. Wo FortiManager ka preview hai jo clear text dikhata hai; FortiGate use encrypted dikhata hai.</li>
</ul>

<div class="warn"><p><b>Dhyan do.</b> Lab install tabhi accept karta hai jab teeno show commands task text se milte hain. Ek bhi missing ho to us task par wapas jao, FortiGate ko seedha edit mat karo: local change conf ko out of sync kar deta hai aur templates ka use is tarah nahi hota.</p></div>

<div class="exam"><p><b>Exam traps.</b> Lab order system, IPsec, CLI, teen assignment attributes (template, ipsec-template, cli-template), dev-db ka modified se not modified hona, aur read-only recommended templates cover karta hai. Inhe bina dekhe jaano.</p></div>

<div class="scn"><h4>Teen templates, ek assignment bhool gayi</h4><p>Ek trainee ne lab khatam kiya par check tunnel par fail hua. Usne KR-Branch-IPsec banaya aur bhara tha, par sirf DNS aur CLI templates assign kiye the. Preview mein sirf das lines thi, expected atthaais nahi, aur wahi uska clue tha. set ipsec-template aur doosre install ke baad preview match hua aur tunnel TO-HQ TRY-FGT par aa gaya.</p><p><b>Lesson:</b> preview line count sabse tez check hai ki har assigned template apni lines de raha hai.</p></div>

<div class="iv"><p class="q">"Templates se naye branch ko provision karne ka process samjhao."</p><p>ADOM mein system, CLI aur IPsec templates banao ya reuse karo, device ko assign karo, dev-db modified ke liye status padho, lines preview karo, device settings install karo, aur FortiGate par aur revision diff mein verify karo. Installation ka order batao aur ye ki package alag step hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>template, cli-template aur ipsec-template se assign hota hai; ye teen alag attributes hain.</li>
<li>Assignment ke baad dev-db modified hota hai jabki FortiGate abhi unchanged hai.</li>
<li>Preview line count aur order batate hain ki har template included hai ya nahi.</li>
<li>Device settings install karo, phir TRY-FGT par DNS, address aur tunnel verify karo.</li>
<li>Revision diff 1 se 2 install ne kya jodha uska saaf record hai.</li>
</ul></div>
`}};export{e as default};