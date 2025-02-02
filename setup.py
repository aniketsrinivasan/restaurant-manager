from setuptools import setup, find_packages

setup(
    name="restaurant_brief",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "langchain",
        "langchain-community",
        "langchain-openai",
        "openai",
        "python-dotenv",
        "pydantic>=2.0.0",
    ]
) 