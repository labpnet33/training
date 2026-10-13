var e={id:`human-approval`,h:{en:`Human approval for any change`,hi:`Har change ke liye human approval`},body:{en:`
<p><b>One idea:</b> the assistant may <b>propose</b> a change, a person <b>approves</b> it, and a separate path <b>applies</b> it. These three steps must be three different things. If one component can do all three, the approval is theatre.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Propose assistant drafts to Review human sees exact diff to Approve signed, expires to Apply with a safety timer to Verify post-checks, log"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Propose</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">assistant drafts</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Review</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">human sees exact diff</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Approve</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">signed, expires</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">with a safety timer</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">post-checks, log</text></svg><p class="cap">The five-step change flow. The assistant owns only the first step.</p></div>
<h3>What a good approval looks like</h3>
<ul><li><b>It shows the exact change</b>: the device, the full command list or a configuration diff. Not "the assistant wants to tidy the uplink", which could mean anything.</li><li><b>It is bound to that exact change.</b> The approval refers to a digest of the change. If one command is edited afterwards, the digest differs and the approval no longer applies.</li><li><b>It comes from a human, through a separate channel</b>, such as a ticketing or change-management system, not through the same chat in which the model could answer "yes" for itself.</li><li><b>The requester cannot approve their own change</b> (two-person rule). For critical devices require two approvers.</li><li><b>It expires.</b> An approval from last week should not authorise a change today.</li><li><b>It is tied to a window</b> and a ticket number, so changes happen when people are ready to watch.</li></ul>
<h3>A gate you can run</h3>
<p>The sketch below has three functions: <code>propose_change</code>, <code>approve</code> and <code>apply_change</code>. The apply function does <b>not</b> touch any device; it only reports what it would do. The digest is a real SHA-256 hash of the change content, shortened to 12 characters. Follow the seven numbered steps in the output.</p>
<pre class="code">import hashlib, json

PENDING = {}      # change_id -&gt; record (a real system would use a database)

def propose_change(requester, device, commands, now):
    """The assistant may only PROPOSE. Nothing is applied here."""
    body = {"device": device, "commands": commands}
    digest = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()[:12]
    change_id = "CHG-" + digest                   # the id is derived from the exact content
    PENDING[change_id] = {"body": body, "digest": digest, "requester": requester,
                          "created": now, "approved_by": None}
    return change_id, digest

def approve(change_id, approver, seen_digest, now, ttl=900):
    """Called from a separate human channel, never by the model."""
    c = PENDING.get(change_id)
    if c is None:
        return "denied: unknown change"
    if approver == c["requester"]:
        return "denied: requester cannot approve their own change"
    if seen_digest != c["digest"]:
        return "denied: approval does not match the change that was reviewed"
    if now - c["created"] &gt; ttl:
        return "denied: approval window expired"
    c["approved_by"] = approver
    return "approved by " + approver

def apply_change(change_id):
    c = PENDING.get(change_id)
    if c is None or c["approved_by"] is None:
        return "refused: not approved"
<span class="c">    # A real system would push the change here with a safety timer and checks. This sketch only records it.</span>
    return "WOULD APPLY to " + c["body"]["device"] + ": " + "; ".join(c["body"]["commands"])

cmds = ["interface Gi1", "description UPLINK-TO-CORE-LAB"]
cid, digest = propose_change("assistant-session-7", "R1", cmds, now=0)
print("proposed:", cid)
print("1.", apply_change(cid))
print("2.", approve(cid, "assistant-session-7", digest, now=60))
print("3.", approve(cid, "alice", "000000000000", now=60))
print("4.", approve(cid, "alice", digest, now=2000))
print("5.", approve(cid, "alice", digest, now=120))
print("6.", apply_change(cid))

cid2, _ = propose_change("assistant-session-7", "R1", cmds + ["shutdown"], now=130)
print("edited change gets a new id:", cid2 != cid)
print("7.", apply_change(cid2))</pre>
<pre class="out">proposed: CHG-e004fb808da6
1. refused: not approved
2. denied: requester cannot approve their own change
3. denied: approval does not match the change that was reviewed
4. denied: approval window expired
5. approved by alice
6. WOULD APPLY to R1: interface Gi1; description UPLINK-TO-CORE-LAB
edited change gets a new id: True
7. refused: not approved</pre>
<ul><li><b>Step 1</b>: applying before approval is refused.</li><li><b>Step 2</b>: the requester (here the assistant session) cannot approve its own change.</li><li><b>Step 3</b>: an approver who did not review this exact content (wrong digest) is denied.</li><li><b>Step 4</b>: an approval after the window (2000 seconds against a 900-second limit) is denied.</li><li><b>Step 5 and 6</b>: a correct, timely approval by someone else succeeds, then apply is allowed.</li><li><b>Step 7</b>: if the assistant edits the commands (adds a shutdown), it creates a <i>new</i> change with a new id, which has no approval, so it is refused. The old approval cannot be reused for the edited content.</li></ul>
<p>The code uses <code>hashlib</code> (Python's hashing toolbox) and <code>json.dumps(..., sort_keys=True)</code> so the same content always gives the same text, and therefore the same digest. <code>None</code> is Python's "nothing yet" value, used for <code>approved_by</code> until someone approves. <code>"; ".join(list)</code> glues a list of strings with a separator.</p>
<h3>Safe application: timers, checks and rollback</h3>
<p>Approval is not the end of caution. Apply with a <b>safety timer</b> so a bad change undoes itself, run <b>pre-checks and post-checks</b> using the same read-only tools, and keep a <b>rollback plan</b>. Junos has this built in as <code>commit confirmed</code>, which you can practise in the <i>jncia-cli</i> module. Other platforms have timed-revert features or can be driven by a script that waits for a check and reverts when it fails.</p>
<pre class="code"><span class="c">! Reference: a change with a safety timer (not run in the simulator)</span>
<span class="c">! Junos: apply and roll back automatically unless confirmed</span>
commit confirmed 5
<span class="c">! ...run the post-checks (show commands) from the read-only tools...</span>
commit

<span class="c">! Idea on other platforms: apply with a timed revert, verify, then confirm</span></pre>
<div class="warn"><p><b>Common mistake.</b> Letting the model call the approval function, or accepting "approved" typed into the assistant's own chat. Approval must come from an identity the model cannot impersonate, in a system the model cannot write to.</p></div>
<div class="exam"><p><b>Exam trap.</b> Be able to list what makes an approval meaningful: exact change shown, bound by digest, separate human channel, no self-approval, expiry, a window, a safety timer and an audit record. And remember the roles: propose (assistant), approve (human), apply (separate component).</p></div>
<div class="eg"><p><b>Worked example.</b> Request: "set the description on R1 Gi1". The assistant proposes the two commands. The approver, a different engineer, sees the exact lines and a ticket reference, approves within the window, and the apply component pushes them with a five-minute timer. A post-check tool confirms the interface is still up, and the change is confirmed.</p></div>
<div class="scn"><h4>"Approved" typed by the assistant</h4><p>An early design asked the user "shall I apply this?" inside the chat, and treated any reply as approval. A test showed that text inside a retrieved document could make the assistant reply "yes" to its own question. The redesign moved approval to the ticketing system, bound it to the change digest, and made the apply component accept only signed approvals from that system.</p><p><b>Lesson:</b> Approval must live outside the conversation the model controls.</p></div>
<div class="iv"><p class="q">"How should human approval work for AI-proposed network changes?"</p><p>The assistant only proposes. A different human reviews the exact commands or diff in a separate system such as change management, and the approval is bound to a digest of that content, expires, and cannot come from the requester. A separate component applies the change with a safety timer, runs post-checks and rolls back on failure. Every step is logged with who, what and when.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Propose, approve and apply are three separate roles; the assistant owns only propose.</li><li>Approval shows the exact change, is bound to its digest, comes from a human on a separate channel, and expires.</li><li>Requesters cannot approve their own change; critical changes need two approvers.</li><li>Apply with a safety timer, run post-checks, keep a rollback plan (for example Junos commit confirmed).</li><li>An edit after approval creates a new change that needs new approval.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> assistant change <b>propose</b> kar sakta hai, insaan use <b>approve</b> karta hai, aur alag raasta use <b>apply</b> karta hai. Yeh teen steps teen alag cheezein honi chahiye. Agar ek hi component teeno kar sake to approval dikhawa hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Propose assistant draft karta hai to Review insaan exact diff dekhta hai to Approve signed, expire hota hai to Apply safety timer ke saath to Verify post-checks, log"><rect x="20" y="40" width="92" height="76" rx="10" fill="#fde68a"/><text x="66" y="74" text-anchor="middle" class="svg-ink" font-size="13">Propose</text><text x="66" y="90" text-anchor="middle" class="svg-muted" font-size="12">assistant draft karta hai</text><line x1="112" y1="78" x2="142" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="146,78 138,73 138,83" fill="#64748b"/><rect x="146" y="40" width="92" height="76" rx="10" fill="#bae6fd"/><text x="192" y="74" text-anchor="middle" class="svg-ink" font-size="13">Review</text><text x="192" y="90" text-anchor="middle" class="svg-muted" font-size="12">insaan exact diff dekhta hai</text><line x1="238" y1="78" x2="268" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="272,78 264,73 264,83" fill="#64748b"/><rect x="272" y="40" width="92" height="76" rx="10" fill="#bbf7d0"/><text x="318" y="74" text-anchor="middle" class="svg-ink" font-size="13">Approve</text><text x="318" y="90" text-anchor="middle" class="svg-muted" font-size="12">signed, expire hota hai</text><line x1="364" y1="78" x2="394" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="398,78 390,73 390,83" fill="#64748b"/><rect x="398" y="40" width="92" height="76" rx="10" fill="#fed7aa"/><text x="444" y="74" text-anchor="middle" class="svg-ink" font-size="13">Apply</text><text x="444" y="90" text-anchor="middle" class="svg-muted" font-size="12">safety timer ke saath</text><line x1="490" y1="78" x2="520" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="524,78 516,73 516,83" fill="#64748b"/><rect x="524" y="40" width="92" height="76" rx="10" fill="#ddd6fe"/><text x="570" y="74" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="570" y="90" text-anchor="middle" class="svg-muted" font-size="12">post-checks, log</text></svg><p class="cap">Paanch-step change flow. Assistant sirf pehle step ka maalik hai.</p></div>
<h3>Achha approval kaisa dikhta hai</h3>
<ul><li><b>Yeh exact change dikhata hai</b>: device, poori command list ya configuration diff. "Assistant uplink saaf karna chahta hai" nahi, jiska kuch bhi matlab ho sakta hai.</li><li><b>Yeh usi exact change se bandha hota hai.</b> Approval change ke digest ka hawala deta hai. Baad mein ek command badli to digest badal jaata hai aur approval lagu nahi rehta.</li><li><b>Yeh insaan se aata hai, alag channel ke through</b>, jaise ticketing ya change-management system, usi chat se nahi jisme model khud ke liye "yes" bol sake.</li><li><b>Requester apna change approve nahi kar sakta</b> (two-person rule). Critical devices ke liye do approvers maango.</li><li><b>Yeh expire hota hai.</b> Pichhle hafte ka approval aaj ke change ko authorise nahi karna chahiye.</li><li><b>Yeh window aur ticket number se bandha hota hai</b>, taaki changes tab hon jab log dekhne ko taiyaar hon.</li></ul>
<h3>Ek gate jo aap chala sakte ho</h3>
<p>Neeche ke sketch mein teen functions hain: <code>propose_change</code>, <code>approve</code> aur <code>apply_change</code>. Apply function kisi device ko <b>nahi</b> chhoota; sirf batata hai ki woh kya karta. Digest change content ka asli SHA-256 hash hai, 12 characters tak chhota kiya hua. Output mein saat numbered steps follow karo.</p>
<pre class="code">import hashlib, json

PENDING = {}      # change_id -&gt; record (a real system would use a database)

def propose_change(requester, device, commands, now):
    """The assistant may only PROPOSE. Nothing is applied here."""
    body = {"device": device, "commands": commands}
    digest = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()[:12]
    change_id = "CHG-" + digest                   # the id is derived from the exact content
    PENDING[change_id] = {"body": body, "digest": digest, "requester": requester,
                          "created": now, "approved_by": None}
    return change_id, digest

def approve(change_id, approver, seen_digest, now, ttl=900):
    """Called from a separate human channel, never by the model."""
    c = PENDING.get(change_id)
    if c is None:
        return "denied: unknown change"
    if approver == c["requester"]:
        return "denied: requester cannot approve their own change"
    if seen_digest != c["digest"]:
        return "denied: approval does not match the change that was reviewed"
    if now - c["created"] &gt; ttl:
        return "denied: approval window expired"
    c["approved_by"] = approver
    return "approved by " + approver

def apply_change(change_id):
    c = PENDING.get(change_id)
    if c is None or c["approved_by"] is None:
        return "refused: not approved"
<span class="c">    # A real system would push the change here with a safety timer and checks. This sketch only records it.</span>
    return "WOULD APPLY to " + c["body"]["device"] + ": " + "; ".join(c["body"]["commands"])

cmds = ["interface Gi1", "description UPLINK-TO-CORE-LAB"]
cid, digest = propose_change("assistant-session-7", "R1", cmds, now=0)
print("proposed:", cid)
print("1.", apply_change(cid))
print("2.", approve(cid, "assistant-session-7", digest, now=60))
print("3.", approve(cid, "alice", "000000000000", now=60))
print("4.", approve(cid, "alice", digest, now=2000))
print("5.", approve(cid, "alice", digest, now=120))
print("6.", apply_change(cid))

cid2, _ = propose_change("assistant-session-7", "R1", cmds + ["shutdown"], now=130)
print("edited change gets a new id:", cid2 != cid)
print("7.", apply_change(cid2))</pre>
<pre class="out">proposed: CHG-e004fb808da6
1. refused: not approved
2. denied: requester cannot approve their own change
3. denied: approval does not match the change that was reviewed
4. denied: approval window expired
5. approved by alice
6. WOULD APPLY to R1: interface Gi1; description UPLINK-TO-CORE-LAB
edited change gets a new id: True
7. refused: not approved</pre>
<ul><li><b>Step 1</b>: approval se pehle apply refuse hota hai.</li><li><b>Step 2</b>: requester (yahan assistant session) apna change approve nahi kar sakta.</li><li><b>Step 3</b>: jis approver ne yeh exact content review nahi kiya (galat digest) woh deny hota hai.</li><li><b>Step 4</b>: window ke baad ka approval (2000 seconds, 900-second limit ke saamne) deny hota hai.</li><li><b>Step 5 aur 6</b>: kisi aur ka sahi, waqt par diya approval safal hota hai, phir apply allowed hai.</li><li><b>Step 7</b>: assistant commands edit kare (shutdown jode) to woh <i>naya</i> change naye id ke saath banta hai, jiska koi approval nahi, isliye refuse hota hai. Purana approval edited content ke liye reuse nahi ho sakta.</li></ul>
<p>Code <code>hashlib</code> (Python ka hashing toolbox) aur <code>json.dumps(..., sort_keys=True)</code> use karta hai taaki same content hamesha same text, aur isliye same digest de. <code>None</code> Python ki "abhi kuch nahi" value hai, jo <code>approved_by</code> ke liye tab tak use hoti hai jab tak koi approve na kare. <code>"; ".join(list)</code> strings ki list ko separator se jodta hai.</p>
<h3>Safe application: timers, checks aur rollback</h3>
<p>Approval ke baad bhi savdhani khatam nahi hoti. <b>Safety timer</b> ke saath apply karo taaki kharab change khud undo ho jaaye, wahi read-only tools se <b>pre-checks aur post-checks</b> chalao, aur <b>rollback plan</b> rakho. Junos mein yeh <code>commit confirmed</code> ke roop mein built-in hai, jise aap <i>jncia-cli</i> module mein practise kar sakte ho. Doosre platforms mein timed-revert features hote hain ya aisi script se chalaya ja sakta hai jo check ka intezaar kare aur fail hone par revert kare.</p>
<pre class="code"><span class="c">! Reference: a change with a safety timer (not run in the simulator)</span>
<span class="c">! Junos: apply and roll back automatically unless confirmed</span>
commit confirmed 5
<span class="c">! ...run the post-checks (show commands) from the read-only tools...</span>
commit

<span class="c">! Idea on other platforms: apply with a timed revert, verify, then confirm</span></pre>
<div class="warn"><p><b>Aam galti.</b> Model ko approval function call karne dena, ya assistant ki apni chat mein type kiya "approved" maan lena. Approval aisi identity se aana chahiye jise model impersonate nahi kar sakta, aise system mein jisme model likh nahi sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Batane layak raho ki approval ko meaningful kya banata hai: exact change dikhana, digest se bandha, alag human channel, self-approval nahi, expiry, window, safety timer aur audit record. Aur roles yaad rakho: propose (assistant), approve (insaan), apply (alag component).</p></div>
<div class="eg"><p><b>Worked example.</b> Request: "R1 Gi1 par description set karo". Assistant do commands propose karta hai. Approver, ek alag engineer, exact lines aur ticket reference dekhta hai, window ke andar approve karta hai, aur apply component unhe paanch-minute ke timer ke saath push karta hai. Post-check tool confirm karta hai ki interface abhi bhi up hai, aur change confirm hota hai.</p></div>
<div class="scn"><h4>"Approved" jo assistant ne khud type kiya</h4><p>Ek early design chat ke andar user se poochhta tha "kya main yeh apply karoon?" aur kisi bhi reply ko approval maanta tha. Ek test se dikha ki retrieved document ka text assistant se uske apne sawaal par "yes" bulwa sakta tha. Redesign ne approval ticketing system mein shift kiya, change digest se bandha, aur apply component ko sirf us system ke signed approvals accept karne wala banaya.</p><p><b>Lesson:</b> Approval us conversation ke bahar rehna chahiye jise model control karta hai.</p></div>
<div class="iv"><p class="q">"AI-proposed network changes ke liye human approval kaise kaam kare?"</p><p>Assistant sirf propose karta hai. Ek alag insaan change management jaise alag system mein exact commands ya diff review karta hai, aur approval us content ke digest se bandha hota hai, expire hota hai, aur requester se nahi aa sakta. Alag component change ko safety timer ke saath apply karta hai, post-checks chalata hai aur failure par rollback karta hai. Har step kisne, kya aur kab ke saath log hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Propose, approve aur apply teen alag roles hain; assistant sirf propose ka maalik hai.</li><li>Approval exact change dikhata hai, uske digest se bandha hai, alag channel par insaan se aata hai, aur expire hota hai.</li><li>Requesters apna change approve nahi kar sakte; critical changes ko do approvers chahiye.</li><li>Safety timer ke saath apply karo, post-checks chalao, rollback plan rakho (jaise Junos commit confirmed).</li><li>Approval ke baad ka edit naya change banata hai jise naya approval chahiye.</li></ul></div>
`}};export{e as default};