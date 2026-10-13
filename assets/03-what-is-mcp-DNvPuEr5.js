var e={id:`what-is-mcp`,h:{en:`What an MCP server is and what it exposes`,hi:`MCP server kya hai aur kya expose karta hai`},body:{en:`
<p><b>One idea:</b> before MCP, every AI application invented its own way to plug in tools, so each tool had to be rewritten for each application. The <b>Model Context Protocol (MCP)</b> is an open standard that fixes this. Think of it as a <b>USB port for AI tools</b>: any application that speaks MCP can use any MCP server without custom wiring.</p>
<h3>Host, client and server</h3>
<table class="cmp"><tr><th>Role</th><th>What it is</th><th>Example</th></tr><tr><td>Host</td><td>The application the user talks to; it contains the model</td><td>A chat assistant or an IDE</td></tr><tr><td>Client</td><td>A connector inside the host that keeps one connection to one server</td><td>Created by the host for each server</td></tr><tr><td>Server</td><td>A program that exposes tools, resources and prompts</td><td>Your "network-readonly" server</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Host app with the model to Client one connection to MCP server tools, resources to Your systems inventory, devices"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">app with the model</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">one connection</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><text x="319" y="70" text-anchor="middle" class="svg-accent" font-size="11">MCP</text><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">MCP server</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">tools, resources</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Your systems</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">inventory, devices</text></svg><p class="cap">The host talks to your systems only through an MCP server that you control.</p></div>
<h3>The three things a server can expose</h3>
<ul><li><b>Tools</b>: functions the model may ask to run, such as "show interfaces brief". Tools can have side effects, so they are the part that needs the most care.</li><li><b>Resources</b>: read-only data identified by a URI, such as a device inventory file or a runbook. The application decides when to load them into the model's context.</li><li><b>Prompts</b>: reusable templates, such as "triage an interface alarm", that a user can pick.</li></ul>
<h3>The messages: JSON-RPC</h3>
<p>MCP messages use <b>JSON-RPC 2.0</b>: every request has a <code>method</code>, optional <code>params</code> and an <code>id</code>; the response carries the same <code>id</code> with a <code>result</code> or an <code>error</code>. The important methods for us are <code>tools/list</code> (what tools exist?) and <code>tools/call</code> (run this one). Messages travel over a <b>transport</b>: <b>stdio</b> (the host starts the server as a local process and talks over its standard input and output) or <b>Streamable HTTP</b> (a network server for remote use, which needs authentication and TLS). Servers are normally started by the host, so a local stdio server runs with the permissions of whoever launched it.</p>
<p>The sketch below answers three messages the way a server would. It uses only Python's standard library and does not connect to anything, so the output is real. Read the messages first, then the replies.</p>
<pre class="code">import json

<span class="c"># A teaching sketch of how an MCP server answers JSON-RPC messages.</span>
<span class="c"># It is NOT the official SDK and does no network I/O; it only shows the message shapes.</span>
TOOL_LIST = [{
    "name": "show_version",
    "description": "Read-only. Return the software version of one lab device.",
    "inputSchema": {
        "type": "object",
        "properties": {"device": {"type": "string", "enum": ["R1", "R2"]}},
        "required": ["device"],
        "additionalProperties": False,
    },
    "annotations": {"readOnlyHint": True},
}]
CANNED = {"R1": "17.9.x (sample)", "R2": "17.6.x (sample)"}

def handle(request):
    method = request.get("method")
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": request["id"], "result": {"tools": TOOL_LIST}}
    if method == "tools/call":
        params = request["params"]
        if params["name"] != "show_version":
            return {"jsonrpc": "2.0", "id": request["id"], "error": {"code": -32602, "message": "Unknown tool"}}
        device = params["arguments"]["device"]
        text = device + " runs " + CANNED[device]
        return {"jsonrpc": "2.0", "id": request["id"], "result": {"content": [{"type": "text", "text": text}], "isError": False}}
    return {"jsonrpc": "2.0", "id": request.get("id"), "error": {"code": -32601, "message": "Method not found"}}

print(json.dumps(handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}), indent=2))
print(json.dumps(handle({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                         "params": {"name": "show_version", "arguments": {"device": "R1"}}})))
print(json.dumps(handle({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
                         "params": {"name": "reload_device", "arguments": {}}})))</pre>
<pre class="out">{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "show_version",
        "description": "Read-only. Return the software version of one lab device.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "device": {
              "type": "string",
              "enum": [
                "R1",
                "R2"
              ]
            }
          },
          "required": [
            "device"
          ],
          "additionalProperties": false
        },
        "annotations": {
          "readOnlyHint": true
        }
      }
    ]
  }
}
{"jsonrpc": "2.0", "id": 2, "result": {"content": [{"type": "text", "text": "R1 runs 17.9.x (sample)"}], "isError": false}}
{"jsonrpc": "2.0", "id": 3, "error": {"code": -32602, "message": "Unknown tool"}}</pre>
<ul><li>A <b>tool definition</b> has a <code>name</code>, a <code>description</code> and an <code>inputSchema</code>, which is JSON Schema describing allowed arguments. Here <code>device</code> must be one of R1 or R2 and no extra fields are allowed.</li><li><code>readOnlyHint</code> is an <b>annotation</b>: a hint that the tool does not change anything. It helps hosts show the right warnings, but it is only a hint. Do not trust hints from servers you do not control; the real protection is the server's own code.</li><li>A successful call returns <code>content</code> (a list of items, here text) and <code>isError</code>. A bad request returns a JSON-RPC <code>error</code> with a numeric code, such as -32602 for invalid parameters or -32601 for an unknown method.</li></ul>
<h3>Using the official SDK</h3>
<p>In practice you do not write the message handling by hand. The official Python SDK includes a helper that turns an ordinary function into a tool, using its type hints and docstring to build the schema and description. This block is reference only and needs the SDK installed:</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - the official Python SDK style</span>
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("network-readonly")

@mcp.tool()
def show_version(device: str) -&gt; str:
    """Read-only. Return the software version of one inventory device."""
    ...   # look up the device in the allow-list, run the fixed show command, return text

if __name__ == "__main__":
    mcp.run()          # speaks MCP over standard input and output (stdio)</pre>
<p>The decorator <code>@mcp.tool()</code> registers the function. The docstring becomes the description the model reads, which is why it starts with "Read-only." in plain words. The rules about devices, allow-lists and limits go inside the function body, in your code.</p>
<div class="warn"><p><b>Common mistake.</b> Installing a community MCP server from the internet and giving it your device credentials. A server runs code with your permissions. Review the source, run it with a limited account, and prefer servers you build and control for anything touching the network.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the roles (host, client, server), the three primitives (tools, resources, prompts), that messages are JSON-RPC 2.0, the two methods <code>tools/list</code> and <code>tools/call</code>, and the two transports (stdio and Streamable HTTP). Annotations are hints, not enforcement.</p></div>
<div class="scn"><h4>One server, three assistants</h4><p>The operations team built one read-only MCP server for device inventory and show commands. The chat assistant, the IDE assistant and a ticketing bot all used it with no extra code, and every rule (allow-list, limits, logging) lived in that single server. When a rule changed, one deployment fixed all three.</p><p><b>Lesson:</b> Put the rules in one server and reuse it everywhere.</p></div>
<div class="iv"><p class="q">"What is MCP and what does an MCP server expose?"</p><p>The Model Context Protocol is an open standard that lets AI applications connect to external capabilities. A server can expose tools (functions the model may call), resources (read-only data) and prompts (templates). Messages are JSON-RPC 2.0, over stdio for local servers or Streamable HTTP for remote ones. For network work I expose a short list of read-only tools and keep all enforcement in the server code.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>MCP is an open standard: hosts and clients on one side, servers on the other.</li><li>Servers expose tools, resources and prompts.</li><li>Messages are JSON-RPC 2.0; the key methods are tools/list and tools/call.</li><li>Transports: stdio (local) and Streamable HTTP (remote, needs authentication and TLS).</li><li>Annotations such as readOnlyHint are hints; enforce safety in your server code.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> MCP se pehle har AI application tools jodne ka apna tareeka banata tha, isliye har tool ko har application ke liye dobara likhna padta tha. <b>Model Context Protocol (MCP)</b> open standard hai jo yeh theek karta hai. Ise <b>AI tools ka USB port</b> samjho: MCP bolne wali koi bhi application kisi bhi MCP server ko bina custom wiring ke use kar sakti hai.</p>
<h3>Host, client aur server</h3>
<table class="cmp"><tr><th>Role</th><th>Yeh kya hai</th><th>Example</th></tr><tr><td>Host</td><td>Application jisse user baat karta hai; usme model hota hai</td><td>Chat assistant ya IDE</td></tr><tr><td>Client</td><td>Host ke andar connector jo ek server se ek connection rakhta hai</td><td>Host har server ke liye banata hai</td></tr><tr><td>Server</td><td>Program jo tools, resources aur prompts expose karta hai</td><td>Aapka "network-readonly" server</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Host model wali app to Client ek connection to MCP server tools, resources to Aapke systems inventory, devices"><rect x="20" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">model wali app</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">ek connection</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><text x="319" y="70" text-anchor="middle" class="svg-accent" font-size="11">MCP</text><rect x="336" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">MCP server</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">tools, resources</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Aapke systems</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">inventory, devices</text></svg><p class="cap">Host aapke systems se sirf us MCP server ke through baat karta hai jo aap control karte ho.</p></div>
<h3>Server teen cheezein expose kar sakta hai</h3>
<ul><li><b>Tools</b>: functions jinhe model chalane ko keh sakta hai, jaise "show interfaces brief". Tools ke side effects ho sakte hain, isliye sabse zyada care isi hisse mein chahiye.</li><li><b>Resources</b>: URI se pehchana gaya read-only data, jaise device inventory file ya runbook. Application decide karti hai ki unhe model ke context mein kab load karna hai.</li><li><b>Prompts</b>: reusable templates, jaise "interface alarm triage karo", jinhe user chun sakta hai.</li></ul>
<h3>Messages: JSON-RPC</h3>
<p>MCP messages <b>JSON-RPC 2.0</b> use karte hain: har request mein ek <code>method</code>, optional <code>params</code> aur ek <code>id</code> hota hai; response usi <code>id</code> ke saath <code>result</code> ya <code>error</code> deta hai. Hamare liye zaroori methods <code>tools/list</code> (kaunse tools hain?) aur <code>tools/call</code> (yeh wala chalao) hain. Messages ek <b>transport</b> par chalte hain: <b>stdio</b> (host server ko local process ki tarah start karta hai aur uske standard input aur output par baat karta hai) ya <b>Streamable HTTP</b> (remote use ke liye network server, jisme authentication aur TLS chahiye). Servers aam taur par host start karta hai, isliye local stdio server usi ki permissions se chalta hai jisne use launch kiya.</p>
<p>Neeche ka sketch teen messages ka jawab waise deta hai jaise server dega. Yeh sirf Python ki standard library use karta hai aur kisi se connect nahi hota, isliye output asli hai. Pehle messages padho, phir replies.</p>
<pre class="code">import json

<span class="c"># A teaching sketch of how an MCP server answers JSON-RPC messages.</span>
<span class="c"># It is NOT the official SDK and does no network I/O; it only shows the message shapes.</span>
TOOL_LIST = [{
    "name": "show_version",
    "description": "Read-only. Return the software version of one lab device.",
    "inputSchema": {
        "type": "object",
        "properties": {"device": {"type": "string", "enum": ["R1", "R2"]}},
        "required": ["device"],
        "additionalProperties": False,
    },
    "annotations": {"readOnlyHint": True},
}]
CANNED = {"R1": "17.9.x (sample)", "R2": "17.6.x (sample)"}

def handle(request):
    method = request.get("method")
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": request["id"], "result": {"tools": TOOL_LIST}}
    if method == "tools/call":
        params = request["params"]
        if params["name"] != "show_version":
            return {"jsonrpc": "2.0", "id": request["id"], "error": {"code": -32602, "message": "Unknown tool"}}
        device = params["arguments"]["device"]
        text = device + " runs " + CANNED[device]
        return {"jsonrpc": "2.0", "id": request["id"], "result": {"content": [{"type": "text", "text": text}], "isError": False}}
    return {"jsonrpc": "2.0", "id": request.get("id"), "error": {"code": -32601, "message": "Method not found"}}

print(json.dumps(handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}), indent=2))
print(json.dumps(handle({"jsonrpc": "2.0", "id": 2, "method": "tools/call",
                         "params": {"name": "show_version", "arguments": {"device": "R1"}}})))
print(json.dumps(handle({"jsonrpc": "2.0", "id": 3, "method": "tools/call",
                         "params": {"name": "reload_device", "arguments": {}}})))</pre>
<pre class="out">{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "show_version",
        "description": "Read-only. Return the software version of one lab device.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "device": {
              "type": "string",
              "enum": [
                "R1",
                "R2"
              ]
            }
          },
          "required": [
            "device"
          ],
          "additionalProperties": false
        },
        "annotations": {
          "readOnlyHint": true
        }
      }
    ]
  }
}
{"jsonrpc": "2.0", "id": 2, "result": {"content": [{"type": "text", "text": "R1 runs 17.9.x (sample)"}], "isError": false}}
{"jsonrpc": "2.0", "id": 3, "error": {"code": -32602, "message": "Unknown tool"}}</pre>
<ul><li><b>Tool definition</b> mein <code>name</code>, <code>description</code> aur <code>inputSchema</code> hota hai, jo allowed arguments batane wala JSON Schema hai. Yahan <code>device</code> R1 ya R2 mein se ek hona chahiye aur koi extra field allowed nahi.</li><li><code>readOnlyHint</code> ek <b>annotation</b> hai: hint ki tool kuch nahi badalta. Yeh hosts ko sahi warnings dikhane mein madad karta hai, lekin sirf hint hai. Jo servers aap control nahi karte unke hints par bharosa mat karo; asli suraksha server ka apna code hai.</li><li>Safal call <code>content</code> (items ki list, yahan text) aur <code>isError</code> lautati hai. Galat request numeric code ke saath JSON-RPC <code>error</code> lautati hai, jaise invalid parameters ke liye -32602 ya anjaane method ke liye -32601.</li></ul>
<h3>Official SDK use karna</h3>
<p>Practice mein aap message handling haath se nahi likhte. Official Python SDK mein ek helper hai jo aam function ko tool bana deta hai, uske type hints aur docstring se schema aur description banakar. Yeh block sirf reference hai aur SDK install hona chahiye:</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator) - the official Python SDK style</span>
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("network-readonly")

@mcp.tool()
def show_version(device: str) -&gt; str:
    """Read-only. Return the software version of one inventory device."""
    ...   # look up the device in the allow-list, run the fixed show command, return text

if __name__ == "__main__":
    mcp.run()          # speaks MCP over standard input and output (stdio)</pre>
<p>Decorator <code>@mcp.tool()</code> function ko register karta hai. Docstring woh description ban jaati hai jo model padhta hai, isiliye woh saadi bhasha mein "Read-only." se shuru hoti hai. Devices, allow-lists aur limits ke rules function ke andar, aapke code mein jaate hain.</p>
<div class="warn"><p><b>Aam galti.</b> Internet se community MCP server install karke use apne device credentials dena. Server aapki permissions ke saath code chalata hai. Source review karo, limited account se chalao, aur network ko chhoone wali kisi bhi cheez ke liye woh servers prefer karo jo aap banate aur control karte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Roles (host, client, server), teen primitives (tools, resources, prompts), ki messages JSON-RPC 2.0 hain, do methods <code>tools/list</code> aur <code>tools/call</code>, aur do transports (stdio aur Streamable HTTP) jaano. Annotations hints hain, enforcement nahi.</p></div>
<div class="scn"><h4>Ek server, teen assistants</h4><p>Operations team ne device inventory aur show commands ke liye ek read-only MCP server banaya. Chat assistant, IDE assistant aur ticketing bot teeno ne ise bina extra code ke use kiya, aur har rule (allow-list, limits, logging) us ek server mein tha. Rule badalne par ek deployment ne teeno ko theek kiya.</p><p><b>Lesson:</b> Rules ek server mein rakho aur sab jagah reuse karo.</p></div>
<div class="iv"><p class="q">"MCP kya hai aur MCP server kya expose karta hai?"</p><p>Model Context Protocol open standard hai jo AI applications ko external capabilities se jodta hai. Server tools (functions jinhe model call kar sakta hai), resources (read-only data) aur prompts (templates) expose kar sakta hai. Messages JSON-RPC 2.0 hain, local servers ke liye stdio par ya remote ke liye Streamable HTTP par. Network kaam ke liye main read-only tools ki chhoti list expose karta hoon aur saara enforcement server code mein rakhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>MCP open standard hai: ek taraf hosts aur clients, doosri taraf servers.</li><li>Servers tools, resources aur prompts expose karte hain.</li><li>Messages JSON-RPC 2.0 hain; key methods tools/list aur tools/call hain.</li><li>Transports: stdio (local) aur Streamable HTTP (remote, authentication aur TLS chahiye).</li><li>readOnlyHint jaise annotations hints hain; safety apne server code mein enforce karo.</li></ul></div>
`}};export{e as default};