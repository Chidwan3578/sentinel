
---

# 3️⃣ CrewAI example

## `examples/crewai/crewai_sentinel.py`

```python
from crewai import Agent, Task, Crew
from sentinel import SentinelClient

sentinel = SentinelClient(
    base_url="http://localhost:3000",
    api_token="sentinel_dev_key",
    agent_id="crewai-agent"
)

def request_secret(resource_name: str) -> str:
    result = sentinel.request_secret(
        resource_id=resource_name,
        intent={
            "task_id": "crewai-task",
            "summary": "CrewAI agent execution",
            "description": f"CrewAI agent needs {resource_name}"
        }
    )

    if result.status == "APPROVED":
        return result.secret.value
    elif result.status == "PENDING":
        raise RuntimeError("Secret request pending approval")
    else:
        raise RuntimeError(f"Access denied: {result.reason}")

def secure_action():
    secret = request_secret("example_api_key")
    return f"Secure action executed with secret {secret[:4]}***"

agent = Agent(
    role="Secure Agent",
    goal="Perform tasks requiring protected secrets",
    backstory="Agent uses Sentinel for secret access control",
    allow_delegation=False,
    verbose=True
)

task = Task(
    description="Perform a secure operation",
    expected_output="Secure operation completed",
    agent=agent,
    function=secure_action
)

if __name__ == "__main__":
    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=True
    )

    crew.kickoff()
