var e={id:`audit-troubleshooting`,h:{en:`Audit logs and troubleshooting agents and tools`,hi:`Audit logs aur agents tatha tools ki troubleshooting`},body:{en:`
<p><b>One idea:</b> when an assistant is allowed to touch a network, you must be able to answer, months later, <b>who asked for what, what ran, and what came back</b>. An <b>audit log</b> is that record. It is also your best troubleshooting tool when an agent behaves oddly.</p>
<h3>What to record</h3>
<table class="cmp"><tr><th>Field</th><th>Why it matters</th></tr><tr><td>Timestamp (UTC)</td><td>Ordering events and correlating with device logs</td></tr><tr><td>User identity</td><td>A person or service, never a shared login</td></tr><tr><td>Tool name and arguments</td><td>Exactly what was requested (secrets removed)</td></tr><tr><td>Outcome</td><td>Allowed, denied with the reason, or error</td></tr><tr><td>Result summary</td><td>Size and a fingerprint of the result, not the sensitive text itself</td></tr><tr><td>Approver and ticket (for changes)</td><td>Who authorised, under which change record</td></tr><tr><td>Request id</td><td>Follow one question across model, server and device logs</td></tr></table>
<h3>What not to record</h3>
<ul><li><b>Secrets</b>: passwords, tokens, keys. Remove them before writing, even if a caller sent one by mistake. A log full of secrets becomes the target.</li><li><b>Full device output</b> when it may contain sensitive data. Keep a size and a hash instead, or store the output in a separate controlled place.</li></ul>
<h3>A tamper-evident log you can run</h3>
<p>Logs are only evidence if nobody can quietly edit them. Real systems send logs to append-only storage and a central collector (see the <i>enarsi-services</i> module for syslog). The sketch below adds a simple <b>hash chain</b>: each entry stores the hash of the previous entry, so changing or removing any entry breaks every hash after it. The timestamps are fixed sample values, so the output is the same every run, and the hashes are real SHA-256 values computed by the code.</p>
<pre class="code">import hashlib, json

LOG = []          # a real system writes to append-only storage, one JSON object per line
SENSITIVE_KEYS = {"password", "secret", "token", "key"}

def clean(arguments):
    """Never write secrets into the log, even if a caller sent one by mistake."""
    return {k: ("[REDACTED]" if k.lower() in SENSITIVE_KEYS else v) for k, v in arguments.items()}

def record(ts, user, tool, arguments, outcome, result_text=""):
    previous = LOG[-1]["entry_hash"] if LOG else "start"
    entry = {
        "ts": ts, "user": user, "tool": tool, "arguments": clean(arguments), "outcome": outcome,
        "result_chars": len(result_text),
        "result_sha256": hashlib.sha256(result_text.encode()).hexdigest()[:16],
        "prev": previous,
    }
    entry["entry_hash"] = hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest()[:16]
    LOG.append(entry)

def verify():
    """Re-compute the chain. Any edited or deleted entry breaks it."""
    previous = "start"
    for position, entry in enumerate(LOG):
        body = {k: v for k, v in entry.items() if k != "entry_hash"}
        again = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()[:16]
        if entry["prev"] != previous or entry["entry_hash"] != again:
            return "BROKEN at entry " + str(position)
        previous = entry["entry_hash"]
    return "chain intact (" + str(len(LOG)) + " entries)"

record("2026-01-05T09:00:01Z", "alice", "show_version", {"device": "R1"}, "allowed", "R1 runs 17.9.x (sample)")
record("2026-01-05T09:00:09Z", "alice", "show_interface", {"device": "R1", "interface": "Gi1; reload"}, "denied: interface name is not valid")
record("2026-01-05T09:01:30Z", "bob", "show_version", {"device": "R2", "password": "not-a-real-secret"}, "denied: unexpected argument(s): password")

for entry in LOG:
    print(json.dumps(entry))
print(verify())
LOG[1]["outcome"] = "allowed"          # someone quietly edits history
print(verify())</pre>
<pre class="out">{"ts": "2026-01-05T09:00:01Z", "user": "alice", "tool": "show_version", "arguments": {"device": "R1"}, "outcome": "allowed", "result_chars": 23, "result_sha256": "7f1f06c5964f334a", "prev": "start", "entry_hash": "a5cdca6752ac2f93"}
{"ts": "2026-01-05T09:00:09Z", "user": "alice", "tool": "show_interface", "arguments": {"device": "R1", "interface": "Gi1; reload"}, "outcome": "denied: interface name is not valid", "result_chars": 0, "result_sha256": "e3b0c44298fc1c14", "prev": "a5cdca6752ac2f93", "entry_hash": "050db31b45383fe5"}
{"ts": "2026-01-05T09:01:30Z", "user": "bob", "tool": "show_version", "arguments": {"device": "R2", "password": "[REDACTED]"}, "outcome": "denied: unexpected argument(s): password", "result_chars": 0, "result_sha256": "e3b0c44298fc1c14", "prev": "050db31b45383fe5", "entry_hash": "dd62f2237e8bd97e"}
chain intact (3 entries)
BROKEN at entry 1</pre>
<ul><li>Each line is one JSON object, so tools such as a log collector can search it. This style is called <b>JSON Lines</b>.</li><li><code>clean()</code> replaces any sensitive-looking argument with <code>[REDACTED]</code>. The third entry shows the password argument was refused and, importantly, never written.</li><li>Denied calls are logged too. A pattern of denials (a model repeatedly asking for a device that is not in the inventory) is a useful signal.</li><li>After the first <code>verify()</code> prints that the chain is intact, one entry is edited. The second <code>verify()</code> reports where the chain breaks.</li></ul>
<h3>Troubleshooting an agent that misbehaves</h3>
<p>When something goes wrong, first decide <b>which layer</b>: the model's choice, the host and client, the server, or the device. Calling the server by hand, without the model, quickly splits the problem in two. The MCP project provides an inspector for that purpose (reference only):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># Reference (not run in the simulator): try the server on its own, without any model</span>
<span class="c"># The MCP project provides an Inspector that lists tools and lets you call them by hand</span>
npx @modelcontextprotocol/inspector python server.py</pre>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>What to check</th></tr><tr><td>The assistant does not list my tool</td><td>Server not started, wrong command or path in the host settings, invalid tool schema</td><td>Host logs; run the server alone and call tools/list</td></tr><tr><td>The connection closes immediately</td><td>A stdio server printed normal text to standard output, which corrupts the protocol messages</td><td>Send logs to standard error or a file, never standard output</td></tr><tr><td>Every call is denied</td><td>Inventory or allow-list empty or misspelt; argument names differ from the schema</td><td>The denial reason in the audit log</td></tr><tr><td>Calls time out</td><td>Device unreachable, slow command, timeout too short, rate limit</td><td>Run the same show command by hand with the same account</td></tr><tr><td>The model invents devices or arguments</td><td>Vague tool descriptions, no enum, long tool list</td><td>Tighten descriptions, add enums, remove unused tools</td></tr><tr><td>Answers are cut off or slow</td><td>Output cap too small or output too big for the model</td><td>Return parsed fields instead of full text</td></tr><tr><td>The model repeats the same call</td><td>The tool result was empty or unclear, no step limit</td><td>Return a clear "no data found" message; add a step limit</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Debugging by turning on "log everything" in production. Verbose logs can capture device output, prompts and secrets. Raise logging in a test environment with sample data, or log hashes and sizes instead of content.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know what an audit record contains, that secrets are never logged, why denied calls are logged, and how a hash chain makes tampering evident. For troubleshooting, remember to separate the model from the server by calling the server directly.</p></div>
<div class="scn"><h4>The server that kept disconnecting</h4><p>A new local MCP server connected for a second and then dropped. The host log said "invalid message". The developer had added a debug <code>print</code> that wrote text to standard output, which the host tried to read as a protocol message. Moving the debug text to standard error fixed it in one line. Calling the server alone with the inspector would have shown the same corruption in seconds.</p><p><b>Lesson:</b> Split the problem: test the server without the model.</p></div>
<div class="iv"><p class="q">"What should an audit log for an AI network assistant contain, and what should it exclude?"</p><p>UTC timestamp, user identity, request id, tool name, sanitised arguments, outcome including denial reasons, a size and fingerprint of the result, and for changes the approver and ticket. It excludes secrets and unfiltered sensitive output. I send logs to append-only central storage and add a hash chain or similar so tampering is detectable, and I alert on unusual patterns such as repeated denials.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Log who, what, when, outcome (including denials), a result fingerprint and the approver for changes.</li><li>Never log secrets; avoid logging full sensitive output.</li><li>Append-only storage and a hash chain make tampering evident.</li><li>Troubleshoot by layer: model, host and client, server, device; call the server directly.</li><li>For stdio servers, never write logs to standard output.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> jab assistant ko network chhoone di jaati hai, to aapko mahino baad bhi jawab dena aana chahiye ki <b>kisne kya manga, kya chala, aur kya wapas aaya</b>. <b>Audit log</b> wahi record hai. Jab agent ajeeb behave kare to yeh aapka sabse achha troubleshooting tool bhi hai.</p>
<h3>Kya record karna hai</h3>
<table class="cmp"><tr><th>Field</th><th>Kyun zaroori hai</th></tr><tr><td>Timestamp (UTC)</td><td>Events ko order karna aur device logs se match karna</td></tr><tr><td>User identity</td><td>Insaan ya service, shared login kabhi nahi</td></tr><tr><td>Tool name aur arguments</td><td>Exactly kya maanga gaya (secrets hata kar)</td></tr><tr><td>Outcome</td><td>Allowed, reason ke saath denied, ya error</td></tr><tr><td>Result summary</td><td>Result ka size aur fingerprint, sensitive text khud nahi</td></tr><tr><td>Approver aur ticket (changes ke liye)</td><td>Kisne authorise kiya, kaunse change record ke tahat</td></tr><tr><td>Request id</td><td>Ek sawaal ko model, server aur device logs mein follow karna</td></tr></table>
<h3>Kya record nahi karna</h3>
<ul><li><b>Secrets</b>: passwords, tokens, keys. Likhne se pehle hata do, chahe kisi caller ne galti se bheje hon. Secrets se bhara log khud target ban jaata hai.</li><li><b>Poora device output</b> jab usme sensitive data ho sakta hai. Uski jagah size aur hash rakho, ya output ko alag controlled jagah store karo.</li></ul>
<h3>Tamper-evident log jo aap chala sakte ho</h3>
<p>Logs tabhi saboot hain jab koi unhe chupchaap edit na kar sake. Asli systems logs ko append-only storage aur central collector mein bhejte hain (syslog ke liye <i>enarsi-services</i> module dekho). Neeche ka sketch ek simple <b>hash chain</b> jodta hai: har entry pichhli entry ka hash store karti hai, isliye koi bhi entry badalne ya hatane par uske baad ke har hash toot jaate hain. Timestamps fixed sample values hain, isliye output har run mein same hai, aur hashes code se nikle asli SHA-256 values hain.</p>
<pre class="code">import hashlib, json

LOG = []          # a real system writes to append-only storage, one JSON object per line
SENSITIVE_KEYS = {"password", "secret", "token", "key"}

def clean(arguments):
    """Never write secrets into the log, even if a caller sent one by mistake."""
    return {k: ("[REDACTED]" if k.lower() in SENSITIVE_KEYS else v) for k, v in arguments.items()}

def record(ts, user, tool, arguments, outcome, result_text=""):
    previous = LOG[-1]["entry_hash"] if LOG else "start"
    entry = {
        "ts": ts, "user": user, "tool": tool, "arguments": clean(arguments), "outcome": outcome,
        "result_chars": len(result_text),
        "result_sha256": hashlib.sha256(result_text.encode()).hexdigest()[:16],
        "prev": previous,
    }
    entry["entry_hash"] = hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest()[:16]
    LOG.append(entry)

def verify():
    """Re-compute the chain. Any edited or deleted entry breaks it."""
    previous = "start"
    for position, entry in enumerate(LOG):
        body = {k: v for k, v in entry.items() if k != "entry_hash"}
        again = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()[:16]
        if entry["prev"] != previous or entry["entry_hash"] != again:
            return "BROKEN at entry " + str(position)
        previous = entry["entry_hash"]
    return "chain intact (" + str(len(LOG)) + " entries)"

record("2026-01-05T09:00:01Z", "alice", "show_version", {"device": "R1"}, "allowed", "R1 runs 17.9.x (sample)")
record("2026-01-05T09:00:09Z", "alice", "show_interface", {"device": "R1", "interface": "Gi1; reload"}, "denied: interface name is not valid")
record("2026-01-05T09:01:30Z", "bob", "show_version", {"device": "R2", "password": "not-a-real-secret"}, "denied: unexpected argument(s): password")

for entry in LOG:
    print(json.dumps(entry))
print(verify())
LOG[1]["outcome"] = "allowed"          # someone quietly edits history
print(verify())</pre>
<pre class="out">{"ts": "2026-01-05T09:00:01Z", "user": "alice", "tool": "show_version", "arguments": {"device": "R1"}, "outcome": "allowed", "result_chars": 23, "result_sha256": "7f1f06c5964f334a", "prev": "start", "entry_hash": "a5cdca6752ac2f93"}
{"ts": "2026-01-05T09:00:09Z", "user": "alice", "tool": "show_interface", "arguments": {"device": "R1", "interface": "Gi1; reload"}, "outcome": "denied: interface name is not valid", "result_chars": 0, "result_sha256": "e3b0c44298fc1c14", "prev": "a5cdca6752ac2f93", "entry_hash": "050db31b45383fe5"}
{"ts": "2026-01-05T09:01:30Z", "user": "bob", "tool": "show_version", "arguments": {"device": "R2", "password": "[REDACTED]"}, "outcome": "denied: unexpected argument(s): password", "result_chars": 0, "result_sha256": "e3b0c44298fc1c14", "prev": "050db31b45383fe5", "entry_hash": "dd62f2237e8bd97e"}
chain intact (3 entries)
BROKEN at entry 1</pre>
<ul><li>Har line ek JSON object hai, isliye log collector jaise tools use search kar sakte hain. Is style ko <b>JSON Lines</b> kehte hain.</li><li><code>clean()</code> kisi bhi sensitive dikhne wale argument ko <code>[REDACTED]</code> se badalta hai. Teesri entry dikhati hai ki password argument refuse hua aur, zaroori baat, kabhi likha nahi gaya.</li><li>Denied calls bhi log hoti hain. Denials ka pattern (model baar-baar aise device ke liye pooch raha jo inventory mein nahi) kaam ka signal hai.</li><li>Pehle <code>verify()</code> ke chain intact batane ke baad ek entry edit hoti hai. Doosra <code>verify()</code> batata hai ki chain kahan tootti hai.</li></ul>
<h3>Galat behave karne wale agent ki troubleshooting</h3>
<p>Kuch galat ho to pehle decide karo ki <b>kaunsi layer</b>: model ki choice, host aur client, server, ya device. Server ko model ke bina haath se call karna problem ko jaldi do hisson mein baant deta hai. MCP project is kaam ke liye inspector deta hai (sirf reference):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
<span class="c"># Reference (not run in the simulator): try the server on its own, without any model</span>
<span class="c"># The MCP project provides an Inspector that lists tools and lets you call them by hand</span>
npx @modelcontextprotocol/inspector python server.py</pre>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Kya check karein</th></tr><tr><td>Assistant mera tool list nahi karta</td><td>Server start nahi hua, host settings mein galat command ya path, invalid tool schema</td><td>Host logs; server akele chalao aur tools/list call karo</td></tr><tr><td>Connection turant band ho jaata hai</td><td>stdio server ne standard output par normal text print kiya, jo protocol messages bigaad deta hai</td><td>Logs standard error ya file mein bhejo, standard output mein kabhi nahi</td></tr><tr><td>Har call deny hoti hai</td><td>Inventory ya allow-list khaali ya galat spelling; argument names schema se alag</td><td>Audit log mein denial reason</td></tr><tr><td>Calls time out hoti hain</td><td>Device unreachable, slow command, timeout bahut chhota, rate limit</td><td>Wahi show command usi account se haath se chalao</td></tr><tr><td>Model devices ya arguments invent karta hai</td><td>Dhundhli tool descriptions, enum nahi, lambi tool list</td><td>Descriptions kaso, enums jodo, unused tools hatao</td></tr><tr><td>Jawab kat jaate hain ya dheeme hain</td><td>Output cap bahut chhota ya output model ke liye bahut bada</td><td>Poore text ki jagah parsed fields lautao</td></tr><tr><td>Model wahi call dohrata hai</td><td>Tool result khaali ya dhundhla, step limit nahi</td><td>Saaf "no data found" message lautao; step limit jodo</td></tr></table>
<div class="warn"><p><b>Aam galti.</b> Production mein "sab kuch log karo" on karke debug karna. Verbose logs device output, prompts aur secrets pakad sakte hain. Test environment mein sample data ke saath logging badhao, ya content ki jagah hashes aur sizes log karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano ki audit record mein kya hota hai, secrets kabhi log nahi hote, denied calls kyun log hoti hain, aur hash chain tampering ko kaise evident banati hai. Troubleshooting ke liye yaad rakho ki server ko seedha call karke model ko server se alag karo.</p></div>
<div class="scn"><h4>Server jo baar-baar disconnect hota tha</h4><p>Naya local MCP server ek second ke liye connect hua aur phir gir gaya. Host log ne kaha "invalid message". Developer ne debug <code>print</code> jodi thi jo standard output par text likhti thi, jise host ne protocol message ki tarah padhne ki koshish ki. Debug text ko standard error par le jaane se ek line mein theek hua. Inspector se server ko akele call karne par wahi corruption seconds mein dikh jaata.</p><p><b>Lesson:</b> Problem baanto: model ke bina server test karo.</p></div>
<div class="iv"><p class="q">"AI network assistant ke audit log mein kya hona chahiye aur kya nahi?"</p><p>UTC timestamp, user identity, request id, tool name, sanitised arguments, denial reasons samet outcome, result ka size aur fingerprint, aur changes ke liye approver aur ticket. Isme secrets aur unfiltered sensitive output nahi hote. Main logs ko append-only central storage mein bhejta hoon aur hash chain ya aisa kuch jodta hoon taaki tampering pakdi ja sake, aur repeated denials jaise unusual patterns par alert karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Log karo kisne, kya, kab, outcome (denials samet), result fingerprint aur changes ke liye approver.</li><li>Secrets kabhi log mat karo; poora sensitive output log karne se bacho.</li><li>Append-only storage aur hash chain tampering ko evident banate hain.</li><li>Layer ke hisaab se troubleshoot karo: model, host aur client, server, device; server ko seedha call karo.</li><li>stdio servers ke liye logs kabhi standard output par mat likho.</li></ul></div>
`}};export{e as default};