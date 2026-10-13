var e={id:`conf-out-of-sync`,h:{en:`Config status when someone changes a FortiGate directly`,hi:`Jab koi FortiGate ko seedha badal de: config status`},body:{en:`
<p>Imagine a restaurant with a master recipe book in the head office. Every kitchen cooks from its own copy. One evening a cook in Madurai adds extra chilli to the sauce on his own. The head office does not know yet. If the head office could look into the kitchen, it would notice that the sauce no longer matches the book. FortiManager does exactly this look, and it reports the result in a few status fields.</p>

<h3>Two directions of difference</h3>
<p>FortiManager stores its own copy of each device. A difference between that copy and the real FortiGate can start on either side, and the status shows which one.</p>
<table class="cmp"><tr><th>Field</th><th>Value</th><th>Meaning</th></tr>
<tr><td><code>dev-db</code></td><td>modified</td><td>FortiManager is ahead. Something changed in FortiManager (for example a template) and has not been installed.</td></tr>
<tr><td><code>conf</code></td><td>out of sync</td><td>The FortiGate is ahead, or unreachable. The device differs from the last copy FortiManager has.</td></tr>
<tr><td><code>cond</code></td><td>OK / pending / unknown</td><td>The overall condition: OK means nothing waits, pending means something is not installed or not agreed, unknown means the device cannot be reached.</td></tr>
<tr><td><code>dm</code></td><td>retrieved / installed / autoupdated</td><td>How the device state last became known to FortiManager.</td></tr>
<tr><td><code>conn</code></td><td>up / down</td><td>Whether the FGFM tunnel is working.</td></tr></table>
<p>This chapter is about the second direction: the change started on the FortiGate. Remember the pair as "dev-db: FortiManager ahead" and "conf: FortiGate ahead".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two directions of difference">
<rect x="40" y="30" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="135" y="56" text-anchor="middle" class="svg-ink" font-size="13">FMG-1 copy</text><text x="135" y="75" text-anchor="middle" class="svg-muted" font-size="12">last known state</text>
<rect x="410" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="505" y="56" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT live</text><text x="505" y="75" text-anchor="middle" class="svg-muted" font-size="12">what runs now</text>
<line x1="230" y1="48" x2="410" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">dev-db modified: FMG ahead</text>
<line x1="410" y1="72" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">conf out of sync: FGT ahead</text>
<rect x="150" y="130" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">cond: pending until both agree</text>
</svg><p class="cap">Two arrows, two fields: read the field name to know who changed first.</p></div>

<h3>Seeing it happen on MDU-FGT</h3>
<p>The lab topology is the one from earlier modules. MDU-FGT runs the package Branch-PP, and the installation has just finished, so everything agrees. Then an engineer opens the FortiGate CLI and types a new firewall policy, number 99, named TEMP-SSH. This is a change made behind FortiManager's back.</p>
<pre class="code"><span class="c">! on MDU-FGT, directly on the FortiGate</span>
config firewall policy
  edit 99
    set name "TEMP-SSH"
    set srcintf "port1"
    set dstintf "port2"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "SSH"
  next
end
<span class="c">! then on FMG-1</span>
diagnose dvm device list MDU-FGT</pre>
<p>Before the change the status line reads <code>dev-db: not modified; conf: in sync; cond: OK; dm: installed</code> and <code>pkg:[installed]Branch-PP</code>. Straight after the change it reads:</p>
<pre class="out">	|- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: pending</span>; dm: installed; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span></pre>
<p>Three things changed at once. <code>conf</code> went to out of sync because the live configuration no longer equals FortiManager's copy. <code>cond</code> went to pending because the two sides disagree. And the <code>pkg</code> field went from installed to modified: the policy table on the FortiGate is no longer the table that Branch-PP installed. The <code>dm</code> field still says installed, because FortiManager has not yet taken any action. What it does next is chapter 3.</p>

<div class="eg"><p><b>Worked example.</b> A status check on Monday shows TRY-FGT with <code>conf: out of sync</code> and <code>conn: up</code>. The tunnel works, so the device is reachable and differs. The reading is "FortiGate ahead". For another device, MDU-FGT, the same line shows <code>conn: down</code> and <code>cond: unknown</code>. Here out of sync means "I cannot see it at all", so the first job is the tunnel, not the configuration.</p></div>

<h3>Why it matters</h3>
<p>Out of sync is a signal, not an error. It means a human or a script changed the device outside the central process. Sometimes this is an emergency fix, sometimes a mistake, and sometimes a security problem. In every case you should know, because the next install may undo the change (chapter 4).</p>

<div class="warn"><p><b>Common mistakes.</b> Reading conf out of sync as "the connection is broken": check conn first. Confusing dev-db modified with conf out of sync: they point in opposite directions. Treating pkg modified as a FortiManager fault: it only says the device policies differ from what the package installed. Waiting for the status to fix itself: a few seconds later it will show in sync, but that does not mean the package was applied (chapter 3).</p></div>

<div class="exam"><p><b>Exam traps.</b> A local change gives conf out of sync at once. A template or package change inside FortiManager gives dev-db modified or pkg modified. Unreachable devices also show out of sync. cond is pending when anything waits and unknown when the device is not connected.</p></div>

<div class="scn"><h4>The status board that turned amber</h4><p>A network operations team watches a board of managed devices. On a Friday evening MDU-FGT turned from OK to pending. The tunnel was up, so the team knew it was not a connectivity issue. They read conf out of sync and pkg modified, logged in to the FortiGate and found a policy number 99 that nobody had announced. They called the engineer on duty, who confirmed an emergency SSH rule for a vendor.</p><p><b>Lesson:</b> the fields conn, conf and pkg together tell you in ten seconds whether the problem is the network or a local change.</p></div>

<div class="iv"><p class="q">"A FortiGate shows conf out of sync in FortiManager. What does that mean and what do you check?"</p><p>The live configuration differs from FortiManager's last copy, or the device is unreachable. I check conn first, then the pkg field and the revision list. If the tunnel is up, someone changed the device locally, so I compare revisions to see what changed and decide whether to keep it or remove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dev-db modified means FortiManager is ahead; conf out of sync means the FortiGate is ahead or unreachable.</li>
<li>A local policy change gives conf out of sync, cond pending and pkg modified.</li>
<li>Always read conn first to separate network problems from local changes.</li>
<li>Out of sync is a signal to investigate, not an error message.</li>
</ul></div>
`,hi:`
<p>Ek restaurant socho jiska master recipe book head office mein hai. Har kitchen apni copy se pakati hai. Ek shaam Madurai ka cook apne aap sauce mein extra mirchi daal deta hai. Head office ko abhi pata nahi. Agar head office kitchen mein jhaank sake to dekhega ki sauce ab book se match nahi karta. FortiManager bilkul yahi jhaankna karta hai, aur result kuch status fields mein batata hai.</p>

<h3>Difference ki do directions</h3>
<p>FortiManager har device ki apni copy rakhta hai. Us copy aur asli FortiGate ke beech difference kisi bhi side se shuru ho sakta hai, aur status batata hai kaun si side.</p>
<table class="cmp"><tr><th>Field</th><th>Value</th><th>Matlab</th></tr>
<tr><td><code>dev-db</code></td><td>modified</td><td>FortiManager aage hai. FortiManager mein kuch badla hai (jaise template) aur install nahi hua.</td></tr>
<tr><td><code>conf</code></td><td>out of sync</td><td>FortiGate aage hai, ya unreachable hai. Device FortiManager ki last copy se alag hai.</td></tr>
<tr><td><code>cond</code></td><td>OK / pending / unknown</td><td>Overall condition: OK matlab kuch wait nahi kar raha, pending matlab kuch install ya agree nahi hua, unknown matlab device tak pahunch nahi sakte.</td></tr>
<tr><td><code>dm</code></td><td>retrieved / installed / autoupdated</td><td>Device ki state FortiManager ko aakhri baar kaise pata chali.</td></tr>
<tr><td><code>conn</code></td><td>up / down</td><td>FGFM tunnel kaam kar raha hai ya nahi.</td></tr></table>
<p>Ye chapter doosri direction ke baare mein hai: change FortiGate par shuru hui. Jodi yaad rakho: "dev-db: FortiManager aage" aur "conf: FortiGate aage".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Difference ki do directions">
<rect x="40" y="30" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="135" y="56" text-anchor="middle" class="svg-ink" font-size="13">FMG-1 copy</text><text x="135" y="75" text-anchor="middle" class="svg-muted" font-size="12">last known state</text>
<rect x="410" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="505" y="56" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT live</text><text x="505" y="75" text-anchor="middle" class="svg-muted" font-size="12">ab jo chal raha hai</text>
<line x1="230" y1="48" x2="410" y2="48" stroke="#64748b" stroke-width="2"/><text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">dev-db modified: FMG aage</text>
<line x1="410" y1="72" x2="230" y2="72" stroke="#64748b" stroke-width="2"/><text x="320" y="92" text-anchor="middle" class="svg-accent" font-size="12">conf out of sync: FGT aage</text>
<rect x="150" y="130" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">cond: pending jab tak dono agree na hon</text>
</svg><p class="cap">Do arrows, do fields: field ka naam padho to pata chalega pehle kisne badla.</p></div>

<h3>MDU-FGT par ise hote dekhna</h3>
<p>Lab topology wahi hai jo pichhle modules mein thi. MDU-FGT package Branch-PP chalata hai, installation abhi khatam hua hai, isliye sab agree karta hai. Phir ek engineer FortiGate CLI kholta hai aur naya firewall policy, number 99, naam TEMP-SSH type karta hai. Ye FortiManager ki peeth peeche hui change hai.</p>
<pre class="code"><span class="c">! on MDU-FGT, directly on the FortiGate</span>
config firewall policy
  edit 99
    set name "TEMP-SSH"
    set srcintf "port1"
    set dstintf "port2"
    set srcaddr "all"
    set dstaddr "all"
    set action accept
    set schedule "always"
    set service "SSH"
  next
end
<span class="c">! then on FMG-1</span>
diagnose dvm device list MDU-FGT</pre>
<p>Change se pehle status line <code>dev-db: not modified; conf: in sync; cond: OK; dm: installed</code> aur <code>pkg:[installed]Branch-PP</code> padhti hai. Change ke turant baad:</p>
<pre class="out">	|- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: pending</span>; dm: installed; conn: up; source: FMG
	|- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[modified]Branch-PP</span></pre>
<p>Teen cheezein ek saath badli. <code>conf</code> out of sync ho gaya kyunki live configuration FortiManager ki copy ke barabar nahi rahi. <code>cond</code> pending ho gaya kyunki dono sides disagree karti hain. Aur <code>pkg</code> field installed se modified ho gaya: FortiGate ki policy table ab wo table nahi hai jo Branch-PP ne install ki thi. <code>dm</code> abhi bhi installed kehta hai, kyunki FortiManager ne abhi koi action nahi liya. Wo aage kya karta hai, wo chapter 3 hai.</p>

<div class="eg"><p><b>Worked example.</b> Somvar ke status check mein TRY-FGT par <code>conf: out of sync</code> aur <code>conn: up</code> hai. Tunnel chal raha hai, matlab device reachable hai aur alag hai. Reading hai "FortiGate aage". Doosre device MDU-FGT par wahi line <code>conn: down</code> aur <code>cond: unknown</code> dikhati hai. Yahan out of sync ka matlab hai "mujhe wo dikhta hi nahi", isliye pehla kaam configuration nahi, tunnel hai.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Out of sync signal hai, error nahi. Iska matlab kisi insaan ya script ne central process ke bahar device badla. Kabhi ye emergency fix hota hai, kabhi galti, kabhi security problem. Har haal mein aapko pata hona chahiye, kyunki agla install change ko undo kar sakta hai (chapter 4).</p>

<div class="warn"><p><b>Common mistakes.</b> Conf out of sync ko "connection toota hai" padhna: pehle conn dekho. Dev-db modified aur conf out of sync ko mix karna: dono ulti directions batate hain. Pkg modified ko FortiManager ki kharabi maan lena: wo sirf kehta hai ki device policies package ke install se alag hain. Status ke apne aap theek hone ka intezaar karna: kuch seconds baad in sync dikhega, par iska matlab ye nahi ki package lag gaya (chapter 3).</p></div>

<div class="exam"><p><b>Exam traps.</b> Local change turant conf out of sync deti hai. FortiManager ke andar template ya package change dev-db modified ya pkg modified deta hai. Unreachable devices bhi out of sync dikhte hain. Kuch bhi wait kare to cond pending, aur device connected na ho to unknown.</p></div>

<div class="scn"><h4>Status board jo amber ho gaya</h4><p>Ek network operations team managed devices ka board dekhti hai. Shukrawar shaam MDU-FGT OK se pending ho gaya. Tunnel up tha, isliye team ko pata tha ki ye connectivity issue nahi hai. Unhone conf out of sync aur pkg modified padha, FortiGate mein login kiya aur policy number 99 mili jiske baare mein kisi ne bataya nahi tha. Unhone duty engineer ko call kiya, jisne vendor ke liye emergency SSH rule confirm kiya.</p><p><b>Lesson:</b> conn, conf aur pkg fields milkar das seconds mein bata dete hain ki problem network hai ya local change.</p></div>

<div class="iv"><p class="q">"FortiManager mein FortiGate par conf out of sync dikh raha hai. Iska matlab kya hai aur aap kya check karoge?"</p><p>Live configuration FortiManager ki last copy se alag hai, ya device unreachable hai. Main pehle conn dekhta hoon, phir pkg field aur revision list. Tunnel up hai to kisi ne locally badla hai, to revisions compare karke dekhta hoon kya badla aur decide karta hoon rakhna hai ya hatana hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dev-db modified matlab FortiManager aage; conf out of sync matlab FortiGate aage ya unreachable.</li>
<li>Local policy change conf out of sync, cond pending aur pkg modified deti hai.</li>
<li>Network problem aur local change alag karne ke liye hamesha pehle conn padho.</li>
<li>Out of sync investigate karne ka signal hai, error message nahi.</li>
</ul></div>
`}};export{e as default};